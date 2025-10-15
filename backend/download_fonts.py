"""
Download Noto Sans fonts for Indian languages
Run this once to download fonts to the project
"""

import os
import urllib.request
from pathlib import Path

def download_font(url, filename, fonts_dir):
    """Download a font file."""
    filepath = fonts_dir / filename
    
    if filepath.exists():
        print(f"✅ Already exists: {filename}")
        return True
    
    try:
        print(f"📥 Downloading: {filename}...")
        urllib.request.urlretrieve(url, filepath)
        print(f"✅ Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False


def main():
    print("=" * 60)
    print("DOWNLOADING NOTO SANS FONTS FOR INDIAN LANGUAGES")
    print("=" * 60)
    
    # Create fonts directory
    fonts_dir = Path("fonts")
    fonts_dir.mkdir(exist_ok=True)
    print(f"\n📁 Fonts directory: {fonts_dir.absolute()}\n")
    
    # Noto Sans fonts from Google Fonts
    # These are free and open source fonts with excellent Unicode support
    fonts_to_download = [
        {
            "name": "Noto Sans Devanagari (Hindi, Marathi)",
            "url": "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf",
            "filename": "NotoSansDevanagari-Regular.ttf"
        },
        {
            "name": "Noto Sans Tamil",
            "url": "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansTamil/hinted/ttf/NotoSansTamil-Regular.ttf",
            "filename": "NotoSansTamil-Regular.ttf"
        },
        {
            "name": "Noto Sans Telugu",
            "url": "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansTelugu/hinted/ttf/NotoSansTelugu-Regular.ttf",
            "filename": "NotoSansTelugu-Regular.ttf"
        },
        {
            "name": "Noto Sans Bengali",
            "url": "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSansBengali/hinted/ttf/NotoSansBengali-Regular.ttf",
            "filename": "NotoSansBengali-Regular.ttf"
        },
        {
            "name": "Noto Sans (Universal)",
            "url": "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf",
            "filename": "NotoSans-Regular.ttf"
        }
    ]
    
    success_count = 0
    for font_info in fonts_to_download:
        print(f"\n{font_info['name']}")
        print("-" * 40)
        if download_font(font_info['url'], font_info['filename'], fonts_dir):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"COMPLETE: {success_count}/{len(fonts_to_download)} fonts downloaded")
    print("=" * 60)
    
    if success_count > 0:
        print("\n✅ Fonts are ready to use!")
        print(f"   Location: {fonts_dir.absolute()}")
        print("\n📝 Next steps:")
        print("   1. Restart your backend server")
        print("   2. Generate a new poster")
        print("   3. Indian languages should now render correctly!")
    else:
        print("\n❌ Font download failed!")
        print("   Please check your internet connection and try again.")


if __name__ == "__main__":
    main()
