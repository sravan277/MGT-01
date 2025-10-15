"""
Text Summary Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
import logging
import json
from pathlib import Path
import google.generativeai as genai

from app.routes.api_keys import get_api_keys
from app.routes.papers import papers_storage
from app.services.storage_manager import storage_manager
from app.services.script_generator import extract_text_from_file

router = APIRouter()
logger = logging.getLogger(__name__)


class SummaryRequest(BaseModel):
    summary_type: str = "comprehensive"


@router.post("/{paper_id}/generate")
async def generate_summary(
    paper_id: str,
    request: SummaryRequest = SummaryRequest(),
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate a text summary from a research paper using Gemini.
    
    Args:
        paper_id: The paper ID
        request: Summary request with type
        api_keys: API keys from dependency
    
    Returns:
        JSON with summary text
    """
    try:
        # Get paper info
        paper_info = storage_manager.get_paper(paper_id)
        if not paper_info:
            if paper_id not in papers_storage:
                raise HTTPException(status_code=404, detail="Paper not found")
            paper_info = papers_storage[paper_id]
        
        # Verify API key
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
        
        # Generate summary based on type
        logger.info(f"Generating {request.summary_type} summary for paper {paper_id}")
        summary = _generate_summary_with_gemini(
            paper_text=paper_text,
            gemini_key=api_keys["gemini_key"],
            summary_type=request.summary_type
        )
        
        # Save summary to file
        output_dir = Path(f"temp/summaries/{paper_id}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        summary_path = output_dir / f"summary_{request.summary_type}.txt"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary)
        
        # Save metadata
        metadata = {
            "paper_id": paper_id,
            "summary": summary,
            "summary_type": request.summary_type,
            "summary_path": str(summary_path)
        }
        
        metadata_path = output_dir / "metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        return {
            "message": "Summary generated successfully",
            "summary": summary,
            "summary_type": request.summary_type,
            "word_count": len(summary.split())
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


def _generate_summary_with_gemini(paper_text: str, gemini_key: str, summary_type: str) -> str:
    """
    Generate summary using Gemini AI.
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
        summary_type: Type of summary to generate
    
    Returns:
        Generated summary text
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    summary_prompts = {
        "comprehensive": f"""Generate a comprehensive summary of the following research paper. Include:
- Main research question and objectives
- Methodology used
- Key findings and results
- Conclusions and implications
- Future work suggestions

Keep it detailed but well-organized (400-500 words).

Paper text:
{paper_text[:15000]}""",
        
        "concise": f"""Generate a concise summary of the following research paper in 150-200 words.
Focus on:
- Main research question
- Key methodology
- Most important findings
- Main conclusion

Paper text:
{paper_text[:15000]}""",
        
        "abstract": f"""Generate an academic abstract for the following research paper.
Follow standard abstract structure:
- Background/Context
- Research Question/Objective
- Methodology
- Results
- Conclusion

Keep it formal and precise (200-250 words).

Paper text:
{paper_text[:15000]}""",
        
        "layman": f"""Generate a summary of the following research paper in simple, easy-to-understand language for a general audience.
Avoid technical jargon and explain concepts clearly.
Structure:
- What problem does this research address?
- How did they study it?
- What did they find?
- Why does it matter?

Keep it engaging and accessible (300-350 words).

Paper text:
{paper_text[:15000]}"""
    }
    
    prompt = summary_prompts.get(summary_type, summary_prompts["comprehensive"])
    
    try:
        response = model.generate_content(prompt)
        summary = response.text.strip()
        logger.info(f"Generated {summary_type} summary: {len(summary.split())} words")
        return summary
    
    except Exception as e:
        logger.error(f"Error generating summary with Gemini: {str(e)}")
        raise


@router.get("/{paper_id}/status")
async def get_summary_status(paper_id: str):
    """Check if summary has been generated for this paper."""
    summary_dir = Path(f"temp/summaries/{paper_id}")
    metadata_path = summary_dir / "metadata.json"
    
    metadata = None
    if metadata_path.exists():
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    
    return {
        "exists": metadata is not None,
        "has_metadata": metadata is not None,
        "summary": metadata.get("summary") if metadata else None,
        "summary_type": metadata.get("summary_type") if metadata else None
    }


@router.get("/{paper_id}/download")
async def download_summary(paper_id: str):
    """Download the generated summary as a text file."""
    summary_dir = Path(f"temp/summaries/{paper_id}")
    metadata_path = summary_dir / "metadata.json"
    
    if not metadata_path.exists():
        raise HTTPException(status_code=404, detail="Summary not found")
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    summary_path = Path(metadata["summary_path"])
    
    if not summary_path.exists():
        raise HTTPException(status_code=404, detail="Summary file not found")
    
    return FileResponse(
        path=str(summary_path),
        media_type="text/plain",
        filename=f"summary_{paper_id}.txt"
    )
