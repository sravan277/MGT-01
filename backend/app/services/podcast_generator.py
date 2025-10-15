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


def generate_podcast_script(paper_text: str, gemini_key: str, duration_minutes: int = 5, language: str = "en-IN") -> Dict:
    """
    Generate a conversational 2-speaker podcast script from a research paper.
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
        duration_minutes: Target duration in minutes (default 5)
        language: Language code for the podcast (default: en-IN)
    
    Returns:
        Dict with podcast script and metadata with 2 speakers
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    # Calculate approximate word count for target duration (150 words per minute for podcasts)
    target_words = duration_minutes * 150
    
    # Language name mapping
    language_names = {
        'en-IN': 'English',
        'hi-IN': 'Hindi (हिन्दी)',
        'ta-IN': 'Tamil (தமிழ்)',
        'te-IN': 'Telugu (తెలుగు)',
        'bn-IN': 'Bengali (বাংলা)',
        'ml-IN': 'Malayalam (മലയാളം)',
        'kn-IN': 'Kannada (ಕನ್ನಡ)',
        'mr-IN': 'Marathi (मराठी)',
        'gu-IN': 'Gujarati (ગુજરાતી)'
    }
    
    language_name = language_names.get(language, 'English')
    
    language_instruction = ""
    example_dialogue = ""
    
    if language != 'en-IN':
        language_instruction = f"""

🔴 CRITICAL LANGUAGE REQUIREMENT 🔴
- Generate EVERY SINGLE WORD of the dialogue in {language_name}
- The title must be in {language_name}
- The description must be in {language_name}
- Speaker 1's dialogue must be entirely in {language_name}
- Speaker 2's dialogue must be entirely in {language_name}
- DO NOT use English words - use only {language_name}
- DO NOT translate literally - make it natural {language_name} conversation
- This is a {language_name} podcast for {language_name} speakers"""
        
        # Language-specific example based on language
        if language == 'hi-IN':
            example_dialogue = """
    {{
      "speaker": 1,
      "text": "नमस्कार! आज हम एक रोचक शोध पत्र पर चर्चा करने जा रहे हैं। क्या आप हमें बता सकते हैं कि यह शोध किस बारे में है?"
    }},
    {{
      "speaker": 2,
      "text": "बिल्कुल! यह शोध एक बहुत ही दिलचस्प समस्या का समाधान प्रस्तुत करता है..."
    }}"""
        elif language == 'ta-IN':
            example_dialogue = """
    {{
      "speaker": 1,
      "text": "வணக்கம்! இன்று நாம் ஒரு சுவாரஸ்யமான ஆராய்ச்சியைப் பற்றி விவாதிக்கப் போகிறோம். இந்த ஆய்வு எதைப் பற்றியது என்று சொல்ல முடியுமா?"
    }},
    {{
      "speaker": 2,
      "text": "நிச்சயமாக! இந்த ஆராய்ச்சி மிகவும் சுவாரஸ்யமான ஒரு பிரச்சினையைத் தீர்க்கிறது..."
    }}"""
        else:
            example_dialogue = f"""
    {{
      "speaker": 1,
      "text": "[Opening greeting in {language_name} and question about the paper]"
    }},
    {{
      "speaker": 2,
      "text": "[Expert response in {language_name} explaining the research]"
    }}"""
    else:
        example_dialogue = """
    {{
      "speaker": 1,
      "text": "Welcome to our podcast! Today we're diving into some fascinating research. Can you tell us what this paper is about?"
    }},
    {{
      "speaker": 2,
      "text": "Absolutely! This research tackles a really interesting problem..."
    }}"""
    
    prompt = f"""You are creating an engaging 2-SPEAKER podcast conversation about a research paper.

Speaker 1 (Host): Female voice - Asks questions, guides the conversation, makes it accessible
Speaker 2 (Expert): Male voice - Explains the research, provides insights, answers questions

Target duration: {duration_minutes} minutes (~{target_words} words)
🌍 OUTPUT LANGUAGE: {language_name}{language_instruction}

Paper text (English - you must discuss this in {language_name}):
{paper_text[:12000]}

Create a natural dialogue between two speakers. Make it feel like a real conversation with:
- Natural back-and-forth exchanges
- Questions and answers
- Reactions and enthusiasm
- Casual conversational language
- Clear explanations in {language_name}

Return ONLY a JSON object with this EXACT format:
{{
  "title": "{f'[Podcast title in {language_name}]' if language != 'en-IN' else 'Catchy podcast title'}",
  "description": "{f'[Brief description in {language_name}]' if language != 'en-IN' else 'Brief 1-2 sentence description'}",
  "duration_minutes": {duration_minutes},
  "dialogue": [{example_dialogue},
    // Continue with {target_words // 20} more dialogue turns in {language_name}...
  ]
}}

✅ CHECKLIST BEFORE RESPONDING:
- [ ] Title is in {language_name}
- [ ] Description is in {language_name}
- [ ] ALL dialogue text is in {language_name}
- [ ] Natural {language_name} conversation style
- [ ] ~{target_words} words total"""

    try:
        logger.info(f"Generating podcast in language: {language} ({language_name})")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        result = json.loads(response_text)
        logger.info(f"Generated podcast script in {language_name}: {result.get('title', 'Untitled')}")
        
        # Log first dialogue line to verify language
        if result.get('dialogue') and len(result['dialogue']) > 0:
            first_line = result['dialogue'][0].get('text', '')[:50]
            logger.info(f"First dialogue preview: {first_line}...")
        
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
        # Voice mapping: Speaker 1 = Female (vidya), Speaker 2 = Male (karun)
        voice_map = {
            1: "vidya",  # Host - Female
            2: "karun"   # Expert - Male
        }
        
        audio_segments = []
        
        # Generate audio for each dialogue turn
        for i, turn in enumerate(dialogue):
            speaker = turn.get("speaker", 1)
            text = turn.get("text", "")
            
            if not text.strip():
                continue
            
            voice = voice_map.get(speaker, "vidya")
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
