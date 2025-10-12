"""
AI Reel Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Optional
import os
import logging
from pathlib import Path

from app.services.reel_generator import generate_reel_summary, generate_reel_video
from app.services.tts_service import generate_audio_sarvam
from app.routes.api_keys import get_api_keys
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager
from app.services.script_generator import extract_text_from_file

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{paper_id}/generate")
async def generate_reel(
    paper_id: str,
    duration: int = 40,
    language: str = "en-IN",
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate an AI Reel from a research paper.
    
    Args:
        paper_id: The paper ID
        duration: Target duration in seconds (default 40)
        language: Language code for narration
        api_keys: API keys from dependency
    
    Returns:
        JSON with reel generation status and download URL
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
        
        # Create reel directory
        reel_dir = Path(f"temp/reels/{paper_id}")
        reel_dir.mkdir(parents=True, exist_ok=True)
        
        # Use hardcoded background video
        hardcoded_video = Path("C:/Users/srava/Documents/Git_projects/SARAL/videoplayback.mp4")
        if not hardcoded_video.exists():
            raise HTTPException(status_code=404, detail="Background video not found at hardcoded path")
        
        bg_video_path = hardcoded_video
        logger.info(f"Using hardcoded background video: {bg_video_path}")
        
        # Extract paper text
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
        
        # Generate reel summary (3 slides + narration)
        logger.info(f"Generating reel summary for paper {paper_id}")
        reel_data = generate_reel_summary(
            paper_text=paper_text,
            gemini_key=api_keys["gemini_key"],
            duration=duration
        )
        
        # Generate narration audio
        logger.info("Generating narration audio")
        narration_text = reel_data["narration"]
        
        # Try Sarvam TTS if available, otherwise use default
        audio_path = reel_dir / "narration.wav"
        if api_keys.get("sarvam_key"):
            try:
                audio_file = generate_audio_sarvam(
                    text=narration_text,
                    output_path=str(audio_path),
                    api_key=api_keys["sarvam_key"],
                    language_code=language
                )
                logger.info(f"Generated Sarvam audio: {audio_file}")
            except Exception as e:
                logger.error(f"Sarvam TTS failed: {str(e)}, using fallback")
                # Fallback to system TTS or skip audio
                raise HTTPException(status_code=500, detail="Audio generation failed")
        else:
            raise HTTPException(status_code=400, detail="Sarvam API key required for audio generation")
        
        # Generate final reel video
        logger.info("Generating final reel video")
        output_video = reel_dir / "reel_final.mp4"
        reel_path = generate_reel_video(
            paper_id=paper_id,
            background_video_path=str(bg_video_path),
            slides_data=reel_data["slides"],
            narration_audio_path=str(audio_path),
            output_path=str(output_video),
            total_duration=duration
        )
        
        return {
            "message": "Reel generated successfully",
            "reel_path": f"/api/reels/{paper_id}/download",
            "duration": duration,
            "slides": len(reel_data["slides"]),
            "narration": narration_text[:100] + "..."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating reel: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate reel: {str(e)}")


@router.get("/{paper_id}/download")
async def download_reel(paper_id: str):
    """Download the generated reel video."""
    reel_path = Path(f"temp/reels/{paper_id}/reel_final.mp4")
    
    if not reel_path.exists():
        raise HTTPException(status_code=404, detail="Reel not found")
    
    return FileResponse(
        path=str(reel_path),
        media_type="video/mp4",
        filename=f"reel_{paper_id}.mp4"
    )


@router.get("/{paper_id}/status")
async def get_reel_status(paper_id: str):
    """Check if a reel has been generated for this paper."""
    reel_path = Path(f"temp/reels/{paper_id}/reel_final.mp4")
    
    return {
        "exists": reel_path.exists(),
        "path": f"/api/reels/{paper_id}/download" if reel_path.exists() else None
    }
