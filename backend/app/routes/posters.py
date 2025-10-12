"""
AI Poster Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Optional
import os
import logging
from pathlib import Path

from app.services.poster_generator import (
    generate_poster_content,
    extract_paper_images,
    create_poster_layout,
    save_poster_metadata
)
from app.routes.api_keys import get_api_keys
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager
from app.services.script_generator import extract_text_from_file

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{paper_id}/generate")
async def generate_poster(
    paper_id: str,
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate an AI poster from a research paper.
    
    Args:
        paper_id: The paper ID
        api_keys: API keys from dependency
    
    Returns:
        JSON with poster generation status and download URL
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
        
        # Generate poster content
        logger.info(f"Generating poster content for paper {paper_id}")
        content = generate_poster_content(
            paper_text=paper_text,
            gemini_key=api_keys["gemini_key"]
        )
        
        # Check if images need to be extracted
        logger.info("Checking for paper images")
        images = extract_paper_images(paper_id)
        
        # If no images found, try to get from paper_info
        if not images and paper_info.get("image_files"):
            logger.info("Using images from paper_info")
            images = [img for img in paper_info["image_files"] if os.path.exists(img)]
        
        logger.info(f"Found {len(images)} images for poster")
        
        # Create poster
        logger.info("Creating poster layout")
        poster_dir = Path(f"temp/posters/{paper_id}")
        poster_dir.mkdir(parents=True, exist_ok=True)
        poster_path = poster_dir / "poster.png"
        
        create_poster_layout(
            content=content,
            images=images,
            output_path=str(poster_path)
        )
        
        # Save metadata
        metadata = {
            **content,
            "poster_path": str(poster_path),
            "num_images": len(images),
            "paper_id": paper_id
        }
        save_poster_metadata(paper_id, metadata)
        
        return {
            "message": "Poster generated successfully",
            "title": content.get("title", "Research Poster"),
            "num_images": len(images),
            "poster_url": f"/api/posters/{paper_id}/view",
            "download_url": f"/api/posters/{paper_id}/download"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating poster: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate poster: {str(e)}")


@router.get("/{paper_id}/view")
async def view_poster(paper_id: str):
    """View the generated poster."""
    poster_path = Path(f"temp/posters/{paper_id}/poster.png")
    
    if not poster_path.exists():
        raise HTTPException(status_code=404, detail="Poster not found")
    
    return FileResponse(
        path=str(poster_path),
        media_type="image/png"
    )


@router.get("/{paper_id}/download")
async def download_poster(paper_id: str):
    """Download the generated poster."""
    poster_path = Path(f"temp/posters/{paper_id}/poster.png")
    
    if not poster_path.exists():
        raise HTTPException(status_code=404, detail="Poster not found")
    
    return FileResponse(
        path=str(poster_path),
        media_type="image/png",
        filename=f"research_poster_{paper_id}.png"
    )


@router.get("/{paper_id}/status")
async def get_poster_status(paper_id: str):
    """Check if a poster has been generated for this paper."""
    poster_path = Path(f"temp/posters/{paper_id}/poster.png")
    metadata_path = Path(f"temp/posters/{paper_id}/metadata.json")
    
    exists = poster_path.exists()
    
    metadata = None
    if metadata_path.exists():
        import json
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    
    return {
        "exists": exists,
        "has_metadata": metadata is not None,
        "poster_url": f"/api/posters/{paper_id}/view" if exists else None,
        "metadata": metadata
    }
