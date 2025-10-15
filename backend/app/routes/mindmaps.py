"""
Mind Map Generation Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Optional, List, Dict
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


@router.post("/{paper_id}/generate")
async def generate_mindmap(
    paper_id: str,
    api_keys: dict = Depends(get_api_keys)
):
    """
    Generate a mind map from a research paper using Gemini.
    
    Args:
        paper_id: The paper ID
        api_keys: API keys from dependency
    
    Returns:
        JSON with mind map data structure
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
        
        # Generate mind map
        logger.info(f"Generating mind map for paper {paper_id}")
        mindmap_data = _generate_mindmap_with_gemini(
            paper_text=paper_text,
            gemini_key=api_keys["gemini_key"]
        )
        
        # Save mind map to file
        output_dir = Path(f"temp/mindmaps/{paper_id}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        mindmap_path = output_dir / "mindmap.json"
        with open(mindmap_path, 'w', encoding='utf-8') as f:
            json.dump(mindmap_data, f, indent=2)
        
        # Save metadata
        metadata = {
            "paper_id": paper_id,
            "mindmap_data": mindmap_data,
            "mindmap_path": str(mindmap_path)
        }
        
        metadata_path = output_dir / "metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        return {
            "message": "Mind map generated successfully",
            "mindmap_data": mindmap_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating mind map: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate mind map: {str(e)}")


def _generate_mindmap_with_gemini(paper_text: str, gemini_key: str) -> Dict:
    """
    Generate mind map structure using Gemini AI.
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
    
    Returns:
        Mind map data structure
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""Analyze the following research paper and create a hierarchical mind map structure.

Paper text:
{paper_text[:15000]}

Generate a mind map as a JSON structure with the following format:
{{
  "nodes": [
    {{
      "id": "root",
      "label": "Main Research Topic (5-8 words)",
      "children": [
        {{
          "id": "branch1",
          "label": "Research Question/Problem",
          "children": [
            {{
              "id": "branch1-1",
              "label": "Sub-topic 1",
              "children": []
            }},
            {{
              "id": "branch1-2",
              "label": "Sub-topic 2",
              "children": []
            }}
          ]
        }},
        {{
          "id": "branch2",
          "label": "Methodology",
          "children": [
            {{
              "id": "branch2-1",
              "label": "Approach/Method 1",
              "children": []
            }},
            {{
              "id": "branch2-2",
              "label": "Approach/Method 2",
              "children": []
            }}
          ]
        }},
        {{
          "id": "branch3",
          "label": "Key Findings",
          "children": [
            {{
              "id": "branch3-1",
              "label": "Finding 1",
              "children": []
            }},
            {{
              "id": "branch3-2",
              "label": "Finding 2",
              "children": []
            }}
          ]
        }},
        {{
          "id": "branch4",
          "label": "Conclusions & Impact",
          "children": [
            {{
              "id": "branch4-1",
              "label": "Main Conclusion",
              "children": []
            }},
            {{
              "id": "branch4-2",
              "label": "Applications/Future Work",
              "children": []
            }}
          ]
        }}
      ]
    }}
  ]
}}

IMPORTANT RULES:
1. Root node should be a concise title of the main research topic (5-8 words)
2. Create 4-6 main branches from root (Research Question, Methodology, Findings, Conclusions, etc.)
3. Each main branch should have 2-4 sub-branches
4. Keep labels concise (max 6-8 words per node)
5. Use hierarchical structure: root → main branches → sub-branches → details
6. Focus on the most important concepts and relationships
7. Return ONLY valid JSON, no additional text

Generate the mind map now:"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        mindmap_data = json.loads(response_text)
        logger.info(f"Generated mind map with {len(mindmap_data.get('nodes', []))} root nodes")
        
        return mindmap_data
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {str(e)}")
        logger.error(f"Response text: {response_text[:500]}")
        
        # Fallback structure
        return {
            "nodes": [
                {
                    "id": "root",
                    "label": "Research Paper",
                    "children": [
                        {
                            "id": "objective",
                            "label": "Research Objective",
                            "children": []
                        },
                        {
                            "id": "method",
                            "label": "Methodology",
                            "children": []
                        },
                        {
                            "id": "results",
                            "label": "Results",
                            "children": []
                        },
                        {
                            "id": "conclusion",
                            "label": "Conclusions",
                            "children": []
                        }
                    ]
                }
            ]
        }
    
    except Exception as e:
        logger.error(f"Error generating mind map with Gemini: {str(e)}")
        raise


@router.get("/{paper_id}/status")
async def get_mindmap_status(paper_id: str):
    """Check if mind map has been generated for this paper."""
    mindmap_dir = Path(f"temp/mindmaps/{paper_id}")
    metadata_path = mindmap_dir / "metadata.json"
    
    metadata = None
    if metadata_path.exists():
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    
    return {
        "exists": metadata is not None,
        "has_metadata": metadata is not None,
        "mindmap_data": metadata.get("mindmap_data") if metadata else None
    }


@router.get("/{paper_id}/download")
async def download_mindmap(paper_id: str):
    """Download the generated mind map as a JSON file."""
    mindmap_dir = Path(f"temp/mindmaps/{paper_id}")
    metadata_path = mindmap_dir / "metadata.json"
    
    if not metadata_path.exists():
        raise HTTPException(status_code=404, detail="Mind map not found")
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    mindmap_path = Path(metadata["mindmap_path"])
    
    if not mindmap_path.exists():
        raise HTTPException(status_code=404, detail="Mind map file not found")
    
    return FileResponse(
        path=str(mindmap_path),
        media_type="application/json",
        filename=f"mindmap_{paper_id}.json"
    )
