"""
AI Reel Generator Service
Creates short-form vertical videos with:
- Top half: Looping background video
- Bottom half: Research paper presentation slides with narration
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import google.generativeai as genai
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)


def generate_reel_summary(paper_text: str, gemini_key: str, duration: int = 40) -> Dict:
    """
    Generate a concise 3-slide summary for a reel (40 seconds).
    
    Args:
        paper_text: Full text of the research paper
        gemini_key: Gemini API key
        duration: Target duration in seconds (default 40)
    
    Returns:
        Dict with slides and narration script
    """
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""You are creating a {duration}-second social media reel explaining a research paper.
Generate EXACTLY 3 slides with concise content and a {duration}-second narration script.

Paper text:
{paper_text[:8000]}

Create a response in this EXACT JSON format:
{{
  "slides": [
    {{
      "title": "Slide 1 title (max 5 words)",
      "points": ["Point 1 (max 8 words)", "Point 2 (max 8 words)"],
      "duration": 12
    }},
    {{
      "title": "Slide 2 title (max 5 words)",
      "points": ["Point 1 (max 8 words)", "Point 2 (max 8 words)"],
      "duration": 14
    }},
    {{
      "title": "Slide 3 title (max 5 words)",
      "points": ["Point 1 (max 8 words)", "Point 2 (max 8 words)"],
      "duration": 14
    }}
  ],
  "narration": "A complete {duration}-second script that flows naturally through all 3 slides. Keep it engaging and conversational for social media."
}}

Requirements:
- Total duration must be EXACTLY {duration} seconds
- Keep text MINIMAL - this is for phone screens
- Make narration engaging and fast-paced
- Focus on the most interesting finding or application"""

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
        logger.info(f"Generated reel summary with {len(result['slides'])} slides")
        return result
    
    except Exception as e:
        logger.error(f"Error generating reel summary: {str(e)}")
        # Fallback to basic summary
        return {
            "slides": [
                {
                    "title": "Research Overview",
                    "points": ["Key findings", "Important results"],
                    "duration": 13
                },
                {
                    "title": "Main Contribution",
                    "points": ["Novel approach", "Significant impact"],
                    "duration": 14
                },
                {
                    "title": "Conclusion",
                    "points": ["Future work", "Applications"],
                    "duration": 13
                }
            ],
            "narration": "This research presents important findings with significant contributions to the field and promising future applications."
        }


def create_slide_image(slide_data: Dict, width: int = 1080, height: int = 960) -> Image.Image:
    """
    Create a single slide image for the reel (bottom half).
    
    Args:
        slide_data: Dict with title and points
        width: Image width (1080 for 1920x1080 reel)
        height: Image height (960 for bottom half)
    
    Returns:
        PIL Image object
    """
    # Create image with gradient background
    img = Image.new('RGB', (width, height), color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts, fallback to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        point_font = ImageFont.truetype("arial.ttf", 40)
    except:
        title_font = ImageFont.load_default()
        point_font = ImageFont.load_default()
    
    # Add gradient effect (simple version)
    for i in range(height):
        color_val = int(26 + (i / height) * 20)
        draw.line([(0, i), (width, i)], fill=(color_val, color_val, color_val + 20))
    
    # Draw title
    title = slide_data['title']
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 80), title, fill='#ffffff', font=title_font)
    
    # Draw underline
    draw.rectangle([title_x, 160, title_x + title_width, 168], fill='#00d9ff')
    
    # Draw bullet points
    y_offset = 250
    for i, point in enumerate(slide_data['points'][:3]):  # Max 3 points
        # Bullet circle
        draw.ellipse([100, y_offset + 5, 130, y_offset + 35], fill='#00d9ff')
        
        # Point text (wrap if too long)
        words = point.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=point_font)
            if bbox[2] - bbox[0] > width - 200:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
        
        for j, line in enumerate(lines[:2]):  # Max 2 lines per point
            draw.text((160, y_offset + (j * 50)), line, fill='#ffffff', font=point_font)
        
        y_offset += 180
    
    return img


def generate_reel_video(
    paper_id: str,
    background_video_path: str,
    slides_data: List[Dict],
    narration_audio_path: str,
    output_path: str,
    total_duration: int = 40
) -> str:
    """
    Generate the final reel video combining background video and slides.
    
    Args:
        paper_id: Paper ID for temp files
        background_video_path: Path to the top background video
        slides_data: List of slide data dicts
        narration_audio_path: Path to narration audio
        output_path: Output video path
        total_duration: Total video duration in seconds
    
    Returns:
        Path to generated reel video
    """
    try:
        # Create temp directory for slides
        temp_dir = Path(f"temp/reels/{paper_id}")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate slide images
        slide_paths = []
        for i, slide in enumerate(slides_data):
            slide_img = create_slide_image(slide)
            slide_path = temp_dir / f"slide_{i}.png"
            slide_img.save(slide_path)
            slide_paths.append(str(slide_path))
            logger.info(f"Created slide {i}: {slide_path}")
        
        # Create video for each slide with specified duration
        slide_videos = []
        for i, (slide_path, slide) in enumerate(zip(slide_paths, slides_data)):
            duration = slide.get('duration', total_duration / len(slides_data))
            slide_video = temp_dir / f"slide_video_{i}.mp4"
            
            # Create video from static image
            cmd = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-i', slide_path,
                '-t', str(duration),
                '-vf', f'scale=1080:960,fps=30',
                '-pix_fmt', 'yuv420p',
                '-c:v', 'libx264',
                str(slide_video)
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            slide_videos.append(str(slide_video))
        
        # Concatenate slide videos
        concat_file = temp_dir / "concat.txt"
        with open(concat_file, 'w') as f:
            for video in slide_videos:
                f.write(f"file '{os.path.abspath(video)}'\n")
        
        slides_combined = temp_dir / "slides_combined.mp4"
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',
            str(slides_combined)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Loop background video to match duration
        looped_bg = temp_dir / "bg_looped.mp4"
        cmd = [
            'ffmpeg', '-y',
            '-stream_loop', '-1',  # Infinite loop
            '-i', background_video_path,
            '-t', str(total_duration),
            '-vf', 'scale=1080:960,fps=30',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            str(looped_bg)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Stack videos vertically (background on top, slides on bottom)
        stacked_video = temp_dir / "stacked.mp4"
        cmd = [
            'ffmpeg', '-y',
            '-i', str(looped_bg),
            '-i', str(slides_combined),
            '-filter_complex', '[0:v][1:v]vstack=inputs=2[v]',
            '-map', '[v]',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            str(stacked_video)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Add narration audio
        cmd = [
            'ffmpeg', '-y',
            '-i', str(stacked_video),
            '-i', narration_audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            output_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        logger.info(f"Successfully generated reel: {output_path}")
        return output_path
    
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error generating reel video: {str(e)}")
        raise
