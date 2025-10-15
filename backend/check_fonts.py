"""
Font Diagnostic Script
Check which fonts are available and can render Indian languages
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def check_windows_fonts():
    """Check Windows fonts directory."""
    font_dir = r"C:\Windows\Fonts"
    print(f"\n=== Checking Windows Fonts Directory: {font_dir} ===\n")
    
    if not os.path.exists(font_dir):
        print("❌ Windows Fonts directory not found!")
        return []
    
    # Look for Unicode-compatible fonts
    target_fonts = [
        "Nirmala.ttf",
        "NirmalaB.ttf", 
        "nirmala.ttf",
        "seguiui.ttf",
        "segoeuib.ttf",
        "msyh.ttc",
        "arial.ttf",
        "calibri.ttf"
    ]
    
    found_fonts = []
    
    for font_name in target_fonts:
        font_path = os.path.join(font_dir, font_name)
        if os.path.exists(font_path):
            print(f"✅ Found: {font_name}")
            found_fonts.append(font_path)
        else:
            print(f"❌ Not found: {font_name}")
    
    # List all .ttf files
    print("\n=== All TTF fonts in directory ===")
    all_ttf = list(Path(font_dir).glob("*.ttf"))
    for ttf in sorted(all_ttf)[:20]:  # Show first 20
        print(f"   {ttf.name}")
    
    return found_fonts


def test_font_rendering(font_path, test_text):
    """Test if a font can render specific text."""
    try:
        font = ImageFont.truetype(font_path, 40)
        
        # Try to render Hindi text
        img = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 10), test_text, fill='black', font=font)
        
        # Check if text was rendered (not just boxes)
        # This is a simple check - if the image has variety in pixels, text was rendered
        pixels = list(img.getdata())
        unique_pixels = len(set(pixels))
        
        if unique_pixels > 2:  # More than just black and white
            return True, "✅ Can render"
        else:
            return False, "❌ Cannot render (shows boxes)"
            
    except Exception as e:
        return False, f"❌ Error: {str(e)}"


def main():
    print("=" * 60)
    print("FONT DIAGNOSTIC TOOL FOR INDIAN LANGUAGES")
    print("=" * 60)
    
    # Test texts in different languages
    test_texts = {
        "Hindi": "नमस्ते दुनिया",
        "Tamil": "வணக்கம் உலகம்",
        "Telugu": "హలో ప్రపంచం",
        "Bengali": "হ্যালো বিশ্ব"
    }
    
    # Check available fonts
    fonts = check_windows_fonts()
    
    if not fonts:
        print("\n❌ NO UNICODE FONTS FOUND!")
        print("\nSolution: Install Noto Sans fonts")
        print("1. Visit: https://fonts.google.com/noto")
        print("2. Download 'Noto Sans Devanagari'")
        print("3. Install the font file")
        return
    
    print(f"\n{'=' * 60}")
    print("TESTING FONT RENDERING")
    print('=' * 60)
    
    # Test each found font with each language
    for font_path in fonts[:3]:  # Test first 3 fonts
        font_name = os.path.basename(font_path)
        print(f"\n📝 Testing: {font_name}")
        print("-" * 40)
        
        for lang, text in test_texts.items():
            can_render, status = test_font_rendering(font_path, text)
            print(f"  {lang:10s} ({text:20s}): {status}")
    
    print("\n" + "=" * 60)
    print("RECOMMENDATION")
    print("=" * 60)
    
    # Find best font
    best_font = None
    for font_path in fonts:
        can_render, _ = test_font_rendering(font_path, "नमस्ते")
        if can_render:
            best_font = font_path
            break
    
    if best_font:
        print(f"✅ Use this font: {os.path.basename(best_font)}")
        print(f"   Full path: {best_font}")
    else:
        print("❌ No suitable font found!")
        print("\n🔧 SOLUTION:")
        print("   Download and install Noto Sans Devanagari font")
        print("   Link: https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari")


if __name__ == "__main__":
    main()
