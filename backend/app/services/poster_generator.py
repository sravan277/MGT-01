"""
AI Poster Generator Service
Creates research posters by combining extracted images and key findings
"""

import os
import json
import logging
import random
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import google.generativeai as genai

logger = logging.getLogger(__name__)


def generate_poster_content(paper_text: str, gemini_key: str) -> Dict:
    """
    Generate poster content (title, key points, findings) from research paper.
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
    
    Returns:
        Dict with poster content
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""Analyze this research paper and create content for an academic poster.

Paper text:
{paper_text[:12000]}

Generate poster content that is visually appealing and informative.

Return ONLY a JSON object with this format:
{{
  "title": "Main title (max 80 characters, impactful)",
  "subtitle": "Brief subtitle or authors (max 60 characters)",
  "key_findings": [
    "Finding 1 (concise, max 120 characters)",
    "Finding 2 (concise, max 120 characters)",
    "Finding 3 (concise, max 120 characters)"
  ],
  "main_text": "Main description paragraph (150-200 words, clear and accessible)",
  "methodology": "Brief methodology (50-80 words)",
  "conclusion": "Key takeaway (50-80 words)"
}}

Important:
- Keep text concise and impactful
- Make it accessible to non-experts
- Focus on visual appeal
- Use clear, simple language"""

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
        logger.info(f"Generated poster content: {result.get('title', 'Untitled')}")
        return result
    
    except Exception as e:
        logger.error(f"Error generating poster content: {str(e)}")
        # Fallback content
        return {
            "title": "Research Poster",
            "subtitle": "Academic Research",
            "key_findings": [
                "Key finding from the research",
                "Important contribution to the field",
                "Novel methodology or results"
            ],
            "main_text": "This research explores important aspects of the field and presents novel findings.",
            "methodology": "Standard research methodology was applied.",
            "conclusion": "Significant contributions to the field."
        }


def extract_paper_images(paper_id: str) -> List[str]:
    """
    Get extracted images from paper.
    
    Args:
        paper_id: Paper ID
    
    Returns:
        List of image paths
    """
    images_dir = Path(f"temp/images/{paper_id}")
    
    if not images_dir.exists():
        logger.warning(f"No images directory found for paper {paper_id}")
        return []
    
    # Get all image files
    image_extensions = ['.png', '.jpg', '.jpeg', '.gif']
    images = []
    
    for ext in image_extensions:
        images.extend(list(images_dir.glob(f"*{ext}")))
    
    # Filter out title slides
    images = [str(img) for img in images if 'title' not in img.name.lower()]
    
    logger.info(f"Found {len(images)} images for paper {paper_id}")
    return images


def create_poster_layout(
    content: Dict,
    images: List[str],
    output_path: str,
    poster_size: Tuple[int, int] = (1200, 1600)
) -> str:
    """
    Create a poster layout with text and images.
    
    Args:
        content: Poster content dict
        images: List of image paths
        output_path: Output path for poster
        poster_size: Poster dimensions (width, height)
    
    Returns:
        Path to generated poster
    """
    try:
        # Create poster canvas
        poster = Image.new('RGB', poster_size, color='white')
        draw = ImageDraw.Draw(poster)
        
        # Colors
        primary_color = (41, 98, 255)  # Blue
        secondary_color = (100, 100, 100)  # Gray
        accent_color = (255, 87, 51)  # Orange
        bg_light = (248, 249, 250)  # Light gray
        
        # Fonts (using default PIL fonts, fallback to basic)
        try:
            title_font = ImageFont.truetype("arial.ttf", 48)
            subtitle_font = ImageFont.truetype("arial.ttf", 24)
            heading_font = ImageFont.truetype("arialbd.ttf", 32)
            body_font = ImageFont.truetype("arial.ttf", 20)
            small_font = ImageFont.truetype("arial.ttf", 16)
        except:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            heading_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        current_y = 40
        margin = 40
        width = poster_size[0]
        
        # === HEADER SECTION ===
        # Title background
        draw.rectangle([0, 0, width, 200], fill=primary_color)
        
        # Title
        title = content.get('title', 'Research Poster')
        title_lines = wrap_text(title, title_font, width - 2*margin, draw)
        for line in title_lines:
            draw.text((margin, current_y), line, fill='white', font=title_font)
            current_y += 60
        
        # Subtitle
        subtitle = content.get('subtitle', '')
        if subtitle:
            draw.text((margin, current_y), subtitle, fill=(230, 230, 230), font=subtitle_font)
            current_y += 40
        
        current_y = 220
        
        # === KEY FINDINGS SECTION ===
        draw.rectangle([margin-10, current_y-10, width-margin+10, current_y+30], fill=accent_color)
        draw.text((margin, current_y), "KEY FINDINGS", fill='white', font=heading_font)
        current_y += 50
        
        findings = content.get('key_findings', [])
        for i, finding in enumerate(findings[:3], 1):
            # Bullet point
            draw.ellipse([margin, current_y+5, margin+15, current_y+20], fill=accent_color)
            # Text
            finding_lines = wrap_text(f"{finding}", body_font, width - 2*margin - 30, draw)
            for line in finding_lines:
                draw.text((margin + 25, current_y), line, fill=secondary_color, font=body_font)
                current_y += 28
            current_y += 10
        
        current_y += 20
        
        # === IMAGES SECTION ===
        if images:
            # Select random images (max 3)
            selected_images = random.sample(images, min(3, len(images)))
            
            img_y = current_y
            img_width = (width - 4*margin) // 3
            img_height = 250
            
            images_added = 0
            for i, img_path in enumerate(selected_images):
                try:
                    # Convert path to string if it's a Path object
                    img_path_str = str(img_path)
                    
                    # Check if file exists
                    if not os.path.exists(img_path_str):
                        logger.warning(f"Image file not found: {img_path_str}")
                        continue
                    
                    img = Image.open(img_path_str)
                    # Convert to RGB if necessary
                    if img.mode not in ('RGB', 'RGBA'):
                        img = img.convert('RGB')
                    
                    # Resize maintaining aspect ratio
                    img.thumbnail((img_width, img_height), Image.Resampling.LANCZOS)
                    
                    # Calculate position
                    x_pos = margin + images_added * (img_width + margin)
                    y_pos = img_y + (img_height - img.size[1]) // 2
                    
                    # Add border
                    draw.rectangle([x_pos-5, y_pos-5, x_pos+img.size[0]+5, y_pos+img.size[1]+5], 
                                   outline=primary_color, width=3)
                    
                    # Paste image
                    if img.mode == 'RGBA':
                        poster.paste(img, (x_pos, y_pos), img)
                    else:
                        poster.paste(img, (x_pos, y_pos))
                    
                    images_added += 1
                except Exception as e:
                    logger.warning(f"Failed to load image {img_path}: {str(e)}")
            
            if images_added > 0:
                current_y += img_height + 40
            else:
                # No images were successfully added, add placeholder text
                draw.text((margin, current_y), "[ Images from research paper ]", 
                          fill=secondary_color, font=body_font)
                current_y += 60
        else:
            # No images available
            draw.rectangle([margin, current_y, width-margin, current_y+100], 
                           fill=bg_light, outline=secondary_color, width=2)
            draw.text((width//2, current_y+40), "No images extracted from paper", 
                      fill=secondary_color, font=body_font, anchor="mm")
            current_y += 120
        
        # === MAIN TEXT SECTION ===
        draw.rectangle([margin-10, current_y-10, width-margin+10, current_y+30], fill=primary_color)
        draw.text((margin, current_y), "OVERVIEW", fill='white', font=heading_font)
        current_y += 50
        
        main_text = content.get('main_text', '')
        text_lines = wrap_text(main_text, body_font, width - 2*margin, draw)
        for line in text_lines:
            draw.text((margin, current_y), line, fill=secondary_color, font=body_font)
            current_y += 28
        
        current_y += 30
        
        # === METHODOLOGY & CONCLUSION (Two columns) ===
        col_width = (width - 3*margin) // 2
        
        # Methodology (Left)
        left_x = margin
        method_y = current_y
        draw.text((left_x, method_y), "METHODOLOGY", fill=accent_color, font=heading_font)
        method_y += 45
        
        methodology = content.get('methodology', '')
        method_lines = wrap_text(methodology, small_font, col_width, draw)
        for line in method_lines:
            draw.text((left_x, method_y), line, fill=secondary_color, font=small_font)
            method_y += 22
        
        # Conclusion (Right)
        right_x = margin + col_width + margin
        conclusion_y = current_y
        draw.text((right_x, conclusion_y), "CONCLUSION", fill=accent_color, font=heading_font)
        conclusion_y += 45
        
        conclusion = content.get('conclusion', '')
        conclusion_lines = wrap_text(conclusion, small_font, col_width, draw)
        for line in conclusion_lines:
            draw.text((right_x, conclusion_y), line, fill=secondary_color, font=small_font)
            conclusion_y += 22
        
        # === FOOTER ===
        footer_y = poster_size[1] - 60
        draw.rectangle([0, footer_y, width, poster_size[1]], fill=bg_light)
        draw.text((margin, footer_y + 20), "Generated by SARAL AI", 
                  fill=secondary_color, font=small_font)
        
        # Save poster
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        poster.save(output_path, 'PNG', quality=95)
        logger.info(f"Poster saved: {output_path}")
        
        return output_path
    
    except Exception as e:
        logger.error(f"Error creating poster: {str(e)}")
        raise


def wrap_text(text: str, font, max_width: int, draw) -> List[str]:
    """
    Wrap text to fit within max_width.
    
    Args:
        text: Text to wrap
        font: Font to use
        max_width: Maximum width in pixels
        draw: ImageDraw object
    
    Returns:
        List of wrapped lines
    """
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def save_poster_metadata(paper_id: str, metadata: Dict) -> bool:
    """
    Save poster metadata to file.
    
    Args:
        paper_id: Paper ID
        metadata: Poster metadata dict
    
    Returns:
        True if successful
    """
    try:
        poster_dir = Path(f"temp/posters/{paper_id}")
        poster_dir.mkdir(parents=True, exist_ok=True)
        
        metadata_file = poster_dir / "metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved poster metadata: {metadata_file}")
        return True
    
    except Exception as e:
        logger.error(f"Error saving poster metadata: {str(e)}")
        return False
