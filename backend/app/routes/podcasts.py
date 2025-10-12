"""
Podcast Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional
import os
import logging
from pathlib import Path

from app.services.podcast_generator import (
    generate_podcast_script,
    generate_podcast_audio,
    save_podcast_metadata,
    load_podcast_metadata
)
from app.routes.api_keys import get_api_keys
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager
from app.services.script_generator import extract_text_from_file

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{paper_id}/generate")
async def generate_podcast(
    paper_id: str,
    duration_minutes: int = 5,
    language: str = "en-IN",
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate a 2-speaker conversational podcast from a research paper.
    
    Args:
        paper_id: The paper ID
        duration_minutes: Target duration in minutes (default 5)
        language: Language code for narration
        api_keys: API keys from dependency
    
    Returns:
        JSON with podcast generation status and metadata
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
        
        # Generate podcast script
        logger.info(f"Generating podcast script for paper {paper_id}")
        podcast_data = generate_podcast_script(
            paper_text=paper_text,
            gemini_key=api_keys["gemini_key"],
            duration_minutes=duration_minutes
        )
        
        # Generate podcast audio from dialogue
        logger.info("Generating 2-speaker podcast audio")
        audio_path = generate_podcast_audio(
            paper_id=paper_id,
            dialogue=podcast_data["dialogue"],
            sarvam_api_key=api_keys["sarvam_key"],
            language=language
        )
        
        # Save metadata
        metadata = {
            **podcast_data,
            "audio_path": audio_path,
            "language": language,
            "paper_id": paper_id
        }
        save_podcast_metadata(paper_id, metadata)
        
        return {
            "message": "2-speaker podcast generated successfully",
            "title": podcast_data.get("title", "Research Podcast"),
            "description": podcast_data.get("description", ""),
            "duration_minutes": duration_minutes,
            "dialogue_turns": len(podcast_data.get("dialogue", [])),
            "speakers": 2,
            "audio_url": f"/api/podcasts/{paper_id}/stream",
            "download_url": f"/api/podcasts/{paper_id}/download"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating podcast: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate podcast: {str(e)}")


@router.get("/{paper_id}/stream")
async def stream_podcast(paper_id: str):
    """Stream the generated podcast audio."""
    audio_path = Path(f"temp/podcasts/{paper_id}/podcast.wav")
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    def iterfile():
        with open(audio_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(iterfile(), media_type="audio/wav")


@router.get("/{paper_id}/download")
async def download_podcast(paper_id: str):
    """Download the generated podcast audio."""
    audio_path = Path(f"temp/podcasts/{paper_id}/podcast.wav")
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/wav",
        filename=f"podcast_{paper_id}.wav"
    )


@router.get("/{paper_id}/metadata")
async def get_podcast_metadata(paper_id: str):
    """Get podcast metadata including script and sections."""
    metadata = load_podcast_metadata(paper_id)
    
    if not metadata:
        raise HTTPException(status_code=404, detail="Podcast metadata not found")
    
    return metadata


@router.get("/{paper_id}/status")
async def get_podcast_status(paper_id: str):
    """Check if a podcast has been generated for this paper."""
    audio_path = Path(f"temp/podcasts/{paper_id}/podcast.wav")
    metadata = load_podcast_metadata(paper_id)
    
    return {
        "exists": audio_path.exists(),
        "has_metadata": metadata is not None,
        "audio_url": f"/api/podcasts/{paper_id}/stream" if audio_path.exists() else None,
        "metadata": metadata
    }
