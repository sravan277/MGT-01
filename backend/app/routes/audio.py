"""
Audio Summary Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional
import os
import logging
import subprocess
import json
from pathlib import Path

from app.services.tts_service import generate_audio_sarvam
from app.routes.api_keys import get_api_keys
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager
from app.services.script_generator import extract_text_from_file
import google.generativeai as genai

router = APIRouter()
logger = logging.getLogger(__name__)


def generate_summary_from_paper(paper_text: str, gemini_key: str) -> str:
    """
    Generate a concise summary from paper text using Gemini.
    
    Args:
        paper_text: Full paper text
        gemini_key: Gemini API key
        
    Returns:
        Summary text
    """
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""You are a research paper summarizer. Generate a clear, concise summary of this research paper.

The summary should be:
- 200-300 words long
- Written in a narrative style suitable for audio narration
- Cover: main objective, methodology, key findings, and significance
- Use simple, clear language
- Avoid technical jargon where possible

Paper text:
{paper_text[:15000]}

Generate a well-structured summary that can be easily understood when heard as audio."""

        response = model.generate_content(prompt)
        summary = response.text.strip()
        
        logger.info(f"Generated summary: {len(summary)} characters")
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise


@router.post("/{paper_id}/generate")
async def generate_audio_summary(
    paper_id: str,
    language: str = "en-IN",
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate audio narration from paper summary.
    
    Args:
        paper_id: The paper ID
        language: Language code for narration (default: en-IN)
        api_keys: API keys from dependency
    
    Returns:
        JSON with audio generation status and metadata
    """
    try:
        # Get paper info
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Verify API keys
        if not api_keys.get("gemini_key"):
            raise HTTPException(status_code=400, detail="Gemini API key required")
        if not api_keys.get("sarvam_key"):
            raise HTTPException(status_code=400, detail="Sarvam API key required")
        
        # Extract paper text
        logger.info(f"Extracting text from paper {paper_id}")
        source_type = paper_info.get("source_type", "pdf")
        if source_type == "pdf":
            pdf_path = paper_info.get("pdf_path")
            if not pdf_path or not os.path.exists(pdf_path):
                raise HTTPException(status_code=404, detail="PDF file not found")
            paper_text = extract_text_from_file(pdf_path)
        else:
            tex_path = paper_info.get("tex_file_path")
            if not tex_path or not os.path.exists(tex_path):
                raise HTTPException(status_code=404, detail="Paper text file not found")
            with open(tex_path, 'r', encoding='utf-8') as f:
                paper_text = f.read()
        
        # Generate summary using Gemini
        logger.info(f"Generating summary for paper {paper_id}")
        summary = generate_summary_from_paper(paper_text, api_keys["gemini_key"])
        
        # Create output directory
        output_dir = Path(f"temp/audio/{paper_id}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save summary to file
        summary_path = output_dir / "summary.txt"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary)
        
        # Generate audio from summary
        logger.info("Generating audio from summary")
        audio_path_wav = output_dir / "audio.wav"
        audio_path_mp3 = output_dir / "audio.mp3"
        
        # Determine voice based on language
        # For English, use male voice (karun), for Indian languages use female voice (vidya)
        voice = "karun" if language == "en-IN" else "vidya"
        
        # Generate WAV audio first
        generate_audio_sarvam(
            text=summary,
            output_path=str(audio_path_wav),
            api_key=api_keys["sarvam_key"],
            language_code=language,
            voice=voice
        )
        
        # Convert WAV to MP3 for better browser compatibility
        logger.info("Converting audio to MP3 format")
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', str(audio_path_wav),
                '-codec:a', 'libmp3lame',
                '-qscale:a', '2',  # High quality
                str(audio_path_mp3)
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info("Audio converted to MP3 successfully")
            audio_path = audio_path_mp3
        except subprocess.CalledProcessError as e:
            logger.warning(f"MP3 conversion failed: {e.stderr.decode() if e.stderr else str(e)}")
            logger.info("Using WAV format instead")
            audio_path = audio_path_wav
        
        # Save metadata
        metadata = {
            "paper_id": paper_id,
            "summary": summary,
            "language": language,
            "audio_path": str(audio_path),
            "summary_path": str(summary_path)
        }
        
        metadata_path = output_dir / "metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        return {
            "message": "Audio summary generated successfully",
            "summary": summary,
            "language": language,
            "duration_estimate": f"{len(summary.split()) // 150} min",
            "audio_url": f"/api/audio/{paper_id}/stream",
            "download_url": f"/api/audio/{paper_id}/download"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating audio summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio summary: {str(e)}")


@router.get("/{paper_id}/stream")
async def stream_audio(paper_id: str):
    """Stream the generated audio (prefers MP3, falls back to WAV)."""
    audio_dir = Path(f"temp/audio/{paper_id}")
    
    # Try MP3 first (better browser compatibility)
    audio_path_mp3 = audio_dir / "audio.mp3"
    if audio_path_mp3.exists():
        def iterfile():
            with open(audio_path_mp3, mode="rb") as file_like:
                yield from file_like
        return StreamingResponse(iterfile(), media_type="audio/mpeg")
    
    # Fallback to WAV
    audio_path_wav = audio_dir / "audio.wav"
    if audio_path_wav.exists():
        def iterfile():
            with open(audio_path_wav, mode="rb") as file_like:
                yield from file_like
        return StreamingResponse(iterfile(), media_type="audio/wav")
    
    raise HTTPException(status_code=404, detail="Audio not found")


@router.get("/{paper_id}/download")
async def download_audio(paper_id: str):
    """Download the generated audio (prefers MP3, falls back to WAV)."""
    audio_dir = Path(f"temp/audio/{paper_id}")
    
    # Try MP3 first (smaller file size, better compatibility)
    audio_path_mp3 = audio_dir / "audio.mp3"
    if audio_path_mp3.exists():
        return FileResponse(
            path=str(audio_path_mp3),
            media_type="audio/mpeg",
            filename=f"audio_summary_{paper_id}.mp3"
        )
    
    # Fallback to WAV
    audio_path_wav = audio_dir / "audio.wav"
    if audio_path_wav.exists():
        return FileResponse(
            path=str(audio_path_wav),
            media_type="audio/wav",
            filename=f"audio_summary_{paper_id}.wav"
        )
    
    raise HTTPException(status_code=404, detail="Audio not found")


@router.get("/{paper_id}/status")
async def get_audio_status(paper_id: str):
    """Check if audio summary has been generated for this paper."""
    audio_dir = Path(f"temp/audio/{paper_id}")
    audio_path_mp3 = audio_dir / "audio.mp3"
    audio_path_wav = audio_dir / "audio.wav"
    
    # Check if either format exists
    audio_exists = audio_path_mp3.exists() or audio_path_wav.exists()
    metadata_path = audio_dir / "metadata.json"
    
    metadata = None
    if metadata_path.exists():
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    
    return {
        "exists": audio_exists,
        "has_metadata": metadata is not None,
        "audio_url": f"/api/audio/{paper_id}/stream" if audio_exists else None,
        "summary": metadata.get("summary") if metadata else None,
        "language": metadata.get("language") if metadata else None
    }
