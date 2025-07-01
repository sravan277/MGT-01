import google.generativeai as genai
import re
import unicodedata
from typing import Dict, List
import os

def extract_paper_metadata(file_path):
    """Extract paper metadata from LaTeX or PDF text file."""
    metadata = {
        "title": "Research Paper",
        "authors": "Author", 
        "date": "2024"
    }
    
    # Check if it's a text file (likely from PDF) or a TeX file
    if file_path.endswith('.txt'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # For text files from PDF, try to extract title from first non-empty line
            lines = content.split('\n')
            for line in lines[:10]:  # Look only in first 10 lines
                if line.strip():
                    metadata["title"] = line.strip()
                    break
            
            # Try to find author information in next few lines
            author_found = False
            for line in lines[1:20]:  # Look in lines 1-20
                # Skip empty lines
                if not line.strip():
                    continue
                
                # If we find words like "abstract" or sections, stop looking
                if re.search(r'\babstract\b|\bintroduction\b|\bsection\b', line.lower()):
                    break
                
                # Check for common author patterns
                if not author_found and not line.startswith(('http', 'www', '@')):
                    if ',' in line or 'university' in line.lower() or 'department' in line.lower():
                        metadata["authors"] = line.strip()
                        author_found = True
            
        except Exception as e:
            print(f"Error extracting metadata from text file: {e}")
        
        return metadata
    
    # Original TeX file processing
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        title_match = re.search(r'\\title\{([^}]+)\}', content)
        if title_match:
            metadata["title"] = title_match.group(1).strip()
        
        author_match = re.search(r'\\author\{([^}]+)\}', content)
        if author_match:
            metadata["authors"] = author_match.group(1).strip()
        
        date_match = re.search(r'\\date\{([^}]+)\}', content)
        if date_match:
            metadata["date"] = date_match.group(1).strip()
            
    except Exception as e:
        print(f"Error extracting metadata from LaTeX file: {e}")
    
    return metadata

def extract_text_from_file(file_path):
    """Extract clean text from LaTeX or text file."""
    # Check if it's a text file (likely from PDF) or a TeX file
    if file_path.endswith('.txt'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content
        except Exception as e:
            print(f"Error extracting text from text file: {e}")
            return ""
    
    # Original TeX file processing
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove LaTeX commands and comments
        content = re.sub(r'%.*?\n', '\n', content)
        content = re.sub(r'\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})*', ' ', content)
        content = re.sub(r'\{[^}]*\}', ' ', content)
        content = re.sub(r'\s+', ' ', content)
        
        return content.strip()
    except Exception as e:
        print(f"Error extracting text from LaTeX file: {e}")
        return ""

def clean_text(text):
    """Clean unicode characters from text."""
    # Replace common unicode quotes and dashes
    text = text.replace('"', '"').replace('"', '"')
    text = text.replace(''', "'").replace(''', "'") 
    text = text.replace('–', '-').replace('—', '-')
    
    # Normalize unicode
    text = unicodedata.normalize('NFKD', text)
    
    return text

def generate_full_script_with_gemini(api_key, input_text):
    """Generate presentation script using Gemini API with improved prompts from app_1.py"""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Enhanced prompt based on app_1.py
    prompt = f"""
Create a script for a 3-5 minute educational video based on this research paper.
STRUCTURE:
Create scripts for exactly these 5 sections:
**Introduction**
**Methodology**
**Results**
**Discussion**
**Conclusion**
Important rules:
1. Each section MUST start with its exact heading as shown above
2. Keep content clear and focused - about 2-3 paragraphs per section
3. Focus on explaining the research in simple terms
4. Avoid technical jargon where possible
5. Make it engaging for a general audience
6. DO NOT include any video/animation directions or [Narrator:] tags
7. Make sure that you do not use contracted words, for example: we'll, we're.
Here’s the paper text to base the script on:
Research Paper Content:
{input_text}

Please generate the complete presentation script with clear section headers:
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating script with Gemini: {e}")
        raise

def generate_bullet_points_with_gemini(api_key, section_text):
    """Generate bullet points for a section using improved prompts."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
Convert this presentation script into 3-5 clear, concise bullet points for a slide.

REQUIREMENTS:
- Each bullet point should be one clear, complete thought
- Use action-oriented language when possible
- Make bullet points parallel in structure
- Avoid sub-bullets or nested items
- Keep each bullet to 1-2 lines maximum
- Use specific, concrete language rather than vague terms

GOOD EXAMPLES:
• "Machine learning models achieved 95% accuracy on test data"
• "New algorithm reduces processing time by 40% compared to existing methods"
• "Results show significant improvement in patient outcomes"

Script text to convert:
{section_text}

Generate exactly 3-5 bullet points in this format:
• Point 1
• Point 2  
• Point 3
• Point 4 (if needed)
• Point 5 (if needed)
"""

    try:
        response = model.generate_content(prompt)
        bullet_text = response.text.strip()
        
        # Extract bullet points more robustly
        bullets = []
        for line in bullet_text.split('\n'):
            line = line.strip()
            if line and (line.startswith('•') or line.startswith('-') or line.startswith('*') or line.startswith('·')):
                bullet = re.sub(r'^[•\-*·]\s*', '', line).strip()
                if bullet:
                    bullets.append(bullet)
        
        # Fallback: split by sentences if no bullets found
        if not bullets and section_text:
            sentences = [s.strip() for s in section_text.split('.') if s.strip()]
            bullets = sentences[:4]  # Take first 4 sentences as bullets
        
        # Ensure we have at least one bullet
        if not bullets:
            bullets = ["Key information from this section"]
        
        return bullets[:5]  # Limit to 5 bullets maximum
        
    except Exception as e:
        print(f"Error generating bullet points: {e}")
        return ["Key information from this section"]

def split_script_into_sections(full_script):
    """Split the generated script into sections."""
    sections = {
        "Introduction": "",
        "Methodology": "", 
        "Results": "",
        "Discussion": "",
        "Conclusion": ""
    }
    
    current_section = None
    lines = full_script.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a section header
        for section_name in sections.keys():
            if section_name.lower() in line.lower() and (
                line.startswith('#') or
                line.startswith('**') or
                line.isupper() or
                ':' in line
            ):
                current_section = section_name
                break
        else:
            # Add content to current section
            if current_section:
                sections[current_section] += line + " "
    
    # Clean up sections
    for section in sections:
        sections[section] = sections[section].strip()
        if not sections[section]:
            sections[section] = f"Content for {section} section needs to be added."
    
    return sections

def clean_script_for_tts_and_video(script_text):
    """Clean script text for TTS and video generation."""
    # Remove markdown formatting
    script_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', script_text)
    script_text = re.sub(r'\*([^*]+)\*', r'\1', script_text)
    script_text = re.sub(r'#+\s*', '', script_text)
    
    # Remove special characters that might cause TTS issues
    script_text = re.sub(r'[^\w\s.,!?;:\-()"]', ' ', script_text)
    script_text = re.sub(r'\s+', ' ', script_text)
    
    return script_text.strip()

def generate_title_introduction(title, authors, date):
    """Generate introduction script for title slide."""
    # If there are multiple authors separated by ',' or 'and', use "First Author et al."
    if ',' in authors:
        first_author = authors.split(',')[0].strip()
        authors = f"{first_author} et al."
    return f"""
Welcome to this presentation on "{title}".
This research was conducted by {authors} and published in {date}.
Today, we'll explore the key findings and contributions of this important work.
Let's begin by understanding the problem this research addresses.
"""
