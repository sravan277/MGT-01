"""
Podcast Generator Service
Creates audio podcasts from research papers using Gemini and Sarvam TTS
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)


def generate_podcast_script(paper_text: str, gemini_key: str, duration_minutes: int = 5) -> Dict:
    """
    Generate a conversational 2-speaker podcast script from a research paper.
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
        duration_minutes: Target duration in minutes (default 5)
    
    Returns:
        Dict with podcast script and metadata with 2 speakers
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    # Calculate approximate word count for target duration (150 words per minute for podcasts)
    target_words = duration_minutes * 150
    
    prompt = f"""You are creating an engaging 2-SPEAKER podcast conversation about a research paper.

Speaker 1 (Host): Female voice - Asks questions, guides the conversation, makes it accessible
Speaker 2 (Expert): Male voice - Explains the research, provides insights, answers questions

Target duration: {duration_minutes} minutes (~{target_words} words)

Paper text:
{paper_text[:12000]}

Create a natural dialogue between two speakers. Make it feel like a real conversation with:
- Natural back-and-forth exchanges
- Questions and answers
- Interruptions and reactions
- Casual language and enthusiasm
- Clear explanations

Return ONLY a JSON object with this EXACT format:
{{
  "title": "Catchy podcast title",
  "description": "Brief 1-2 sentence description",
  "duration_minutes": {duration_minutes},
  "dialogue": [
    {{
      "speaker": 1,
      "text": "Welcome to our podcast! Today we're diving into some fascinating research. Can you tell us what this paper is about?"
    }},
    {{
      "speaker": 2,
      "text": "Absolutely! This research tackles a really interesting problem..."
    }},
    {{
      "speaker": 1,
      "text": "That sounds amazing! What made this research so important?"
    }}
    // Continue alternating speakers naturally...
  ]
}}

Important rules:
- Use "speaker": 1 for the host (female voice)
- Use "speaker": 2 for the expert (male voice)
- Make dialogue natural and engaging
- Keep each turn conversational (2-4 sentences usually)
- Total dialogue should be ~{target_words} words"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        result = json.loads(response_text)
        logger.info(f"Generated podcast script: {result.get('title', 'Untitled')}")
        return result
    
    except Exception as e:
        logger.error(f"Error generating podcast script: {str(e)}")
        # Fallback to basic dialogue
        return {
            "title": "Research Paper Podcast",
            "description": "An audio discussion of the research paper",
            "duration_minutes": duration_minutes,
            "dialogue": [
                {
                    "speaker": 1,
                    "text": "Welcome to our podcast! Today we're discussing an exciting research paper."
                },
                {
                    "speaker": 2,
                    "text": "Thanks for having me! This research explores some fascinating findings that could have real-world impact."
                },
                {
                    "speaker": 1,
                    "text": "That sounds great! Let's dive into the details."
                }
            ]
        }


def generate_podcast_audio(
    paper_id: str,
    dialogue: List[Dict],
    sarvam_api_key: str,
    language: str = "en-IN",
    output_path: Optional[str] = None
) -> str:
    """
    Generate podcast audio from 2-speaker dialogue using Sarvam TTS.
    
    Args:
        paper_id: Paper ID for organizing files
        dialogue: List of dialogue entries with speaker and text
        sarvam_api_key: Sarvam API key
        language: Language code (default: en-IN)
        output_path: Custom output path (optional)
    
    Returns:
        Path to generated audio file
    """
    from app.services.tts_service import generate_audio_sarvam
    import subprocess
    
    # Create podcast directory
    podcast_dir = Path(f"temp/podcasts/{paper_id}")
    podcast_dir.mkdir(parents=True, exist_ok=True)
    
    if not output_path:
        output_path = str(podcast_dir / "podcast.wav")
    
    logger.info(f"Generating 2-speaker podcast audio for paper {paper_id}")
    
    try:
        # Voice mapping: Speaker 1 = Female (meera), Speaker 2 = Male (arjun)
        voice_map = {
            1: "meera",  # Host - Female
            2: "arjun"   # Expert - Male
        }
        
        audio_segments = []
        
        # Generate audio for each dialogue turn
        for i, turn in enumerate(dialogue):
            speaker = turn.get("speaker", 1)
            text = turn.get("text", "")
            
            if not text.strip():
                continue
            
            voice = voice_map.get(speaker, "meera")
            segment_path = podcast_dir / f"segment_{i:03d}_speaker{speaker}.wav"
            
            logger.info(f"Generating segment {i+1}/{len(dialogue)} - Speaker {speaker} ({voice})")
            
            # Generate audio for this segment
            audio_file = generate_audio_sarvam(
                text=text,
                output_path=str(segment_path),
                api_key=sarvam_api_key,
                language_code=language,
                voice=voice
            )
            
            if os.path.exists(audio_file):
                audio_segments.append(audio_file)
            else:
                logger.warning(f"Segment {i} generation failed")
        
        if not audio_segments:
            raise ValueError("No audio segments generated")
        
        # Combine all segments using ffmpeg
        logger.info(f"Combining {len(audio_segments)} audio segments")
        
        # Create concat file for ffmpeg
        concat_file = podcast_dir / "concat_list.txt"
        with open(concat_file, 'w') as f:
            for segment in audio_segments:
                # FFmpeg requires absolute paths in concat file
                abs_path = os.path.abspath(segment)
                f.write(f"file '{abs_path}'\n")
        
        # Combine audio segments
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, check=True)
        
        logger.info(f"Podcast audio generated: {output_path}")
        return output_path
    
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error combining audio: {e.stderr.decode() if e.stderr else str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error generating podcast audio: {str(e)}")
        raise


def save_podcast_metadata(paper_id: str, metadata: Dict) -> bool:
    """
    Save podcast metadata to file.
    
    Args:
        paper_id: Paper ID
        metadata: Podcast metadata dict
    
    Returns:
        True if successful
    """
    try:
        podcast_dir = Path(f"temp/podcasts/{paper_id}")
        podcast_dir.mkdir(parents=True, exist_ok=True)
        
        metadata_file = podcast_dir / "metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved podcast metadata: {metadata_file}")
        return True
    
    except Exception as e:
        logger.error(f"Error saving podcast metadata: {str(e)}")
        return False


def load_podcast_metadata(paper_id: str) -> Optional[Dict]:
    """
    Load podcast metadata from file.
    
    Args:
        paper_id: Paper ID
    
    Returns:
        Metadata dict or None if not found
    """
    try:
        metadata_file = Path(f"temp/podcasts/{paper_id}/metadata.json")
        
        if metadata_file.exists():
            with open(metadata_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        return None
    
    except Exception as e:
        logger.error(f"Error loading podcast metadata: {str(e)}")
        return None
