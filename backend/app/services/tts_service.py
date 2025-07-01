import os
from pathlib import Path
from typing import Dict, List, Optional
from .sarvam_sdk import SarvamTTS, SarvamTTSError
import re
import subprocess
import grapheme  # Add this import for proper Unicode grapheme handling

def clean_script_for_tts_and_video(script_text):
    """Clean script text for TTS processing."""
    if not script_text or not script_text.strip():
        return ""

    script_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', script_text)
    script_text = re.sub(r'\*([^*]+)\*', r'\1', script_text)
    script_text = re.sub(r'#+\s*', '', script_text)
    script_text = re.sub(r'[^\w\s.,!?;:\-()"\']', ' ', script_text)
    script_text = re.sub(r'\s+', ' ', script_text)

    return script_text.strip()

def ensure_audio_is_generated(
    sarvam_api_key: str,
    language: str,
    paper_id: str,
    title_intro_script: str,
    sections_scripts: Dict[str, str],
    voice_selections: Dict[str, str],
    hinglish_iterations: int = 3,
    openai_api_key: Optional[str] = None,
    show_hindi_debug: bool = False
) -> List[str]:
    """Generate audio files - simplified approach aligned with Streamlit"""
    
    audio_files = []
    output_dir = f"temp/audio/{paper_id}"
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    if not sarvam_api_key or sarvam_api_key.strip() == "":
        raise ValueError("Sarvam API key is required")

    voice = voice_selections.get(language, "meera")
    print(f"Using voice: {voice}")

    # Initialize TTS client
    try:
        tts_client = SarvamTTS(api_key=sarvam_api_key)
        
        # Simple connection test
        if not tts_client.test_connection():
            raise ValueError("Failed to connect to Sarvam API")
        
        print("✓ Connected to Sarvam TTS API")
        
    except Exception as e:
        print(f"TTS client initialization failed: {e}")
        raise ValueError(f"Failed to initialize TTS client: {e}")

    successful_generations = 0

    try:
        # Generate title audio
        if title_intro_script and title_intro_script.strip():
            print("Generating title audio...")
            title_audio_path = os.path.join(output_dir, "00_title_introduction.wav")
            
            cleaned_text = clean_script_for_tts_and_video(title_intro_script)
            if cleaned_text:
                success = tts_client.synthesize_long_text(
                    text=cleaned_text,
                    output_path=title_audio_path,
                    voice=voice,
                    max_chunk_length=500  # Smaller chunks for reliability
                )
                
                if success:
                    audio_files.append(title_audio_path)
                    successful_generations += 1
                    print(f"✓ Title audio: {title_audio_path}")

        # Generate section audios
        section_order = ["Introduction", "Methodology", "Results", "Discussion", "Conclusion"]
        
        for i, section_name in enumerate(section_order, start=1):
            if section_name in sections_scripts:
                script_text = sections_scripts[section_name]
                
                if not script_text or not script_text.strip():
                    continue

                print(f"Generating {section_name} audio...")
                audio_path = os.path.join(output_dir, f"{i:02d}_{section_name.lower()}.wav")
                
                cleaned_text = clean_script_for_tts_and_video(script_text)
                if cleaned_text:
                    success = tts_client.synthesize_long_text(
                        text=cleaned_text,
                        output_path=audio_path,
                        voice=voice,
                        max_chunk_length=500
                    )
                    
                    if success:
                        audio_files.append(audio_path)
                        successful_generations += 1
                        print(f"✓ {section_name} audio: {audio_path}")

        if successful_generations == 0:
            raise ValueError("No audio files were generated successfully")

        print(f"✓ Generated {successful_generations} audio files")
        return {
            "audio_files": [Path(f).name for f in audio_files]
        }

    except Exception as e:
        print(f"Audio generation error: {e}")
        raise



def ensure_hindi_audio_is_generated(
    sarvam_api_key: str,
    paper_id: str,
    title_intro_script: str,
    sections_scripts: Dict[str, str],
    voice_selections: Dict[str, str],
    hinglish_iterations: int = 3,
    openai_api_key: Optional[str] = None,
    show_hindi_debug: bool = False
) -> Dict[str, List[str]]:
    """Generate audio files specifically for Hindi scripts with proper chunking
    
    Hindi script requires specialized handling for optimal TTS results:
    - Smaller chunk sizes (max 490 characters)
    - Careful sentence boundary detection
    - Proper handling of mixed script content (Hindi + Latin characters)
    """
    
    audio_files = []
    output_dir = f"temp/audio/{paper_id}"
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    if not sarvam_api_key or sarvam_api_key.strip() == "":
        raise ValueError("Sarvam API key is required")

    # Use appropriate voice for Hindi content
    voice = voice_selections.get("hindi", "meera")
    print(f"Using Hindi voice: {voice}")

    # Initialize TTS client
    try:
        tts_client = SarvamTTS(api_key=sarvam_api_key)
        
        # Simple connection test
        if not tts_client.test_connection():
            raise ValueError("Failed to connect to Sarvam API")
        
        print("✓ Connected to Sarvam TTS API")
        
    except Exception as e:
        print(f"TTS client initialization failed: {e}")
        raise ValueError(f"Failed to initialize TTS client: {e}")

    successful_generations = 0
    
    # Add a Hindi-specific chunking method to TTS client
    def chunk_hindi_text(text: str, max_chunk_length: int = 450) -> List[str]:
        """Create smaller chunks for Hindi text, respecting sentence boundaries and keeping grapheme clusters intact"""
        # First check if text is shorter than max length
        if grapheme.length(text) <= max_chunk_length:
            return [text]
        
        # Split on sentence boundaries with priority to Devanagari full stops
        # This regex handles Hindi sentence endings (Devanagari danda and double danda) and standard punctuation
        sentences = re.split(r'(?<=[।॥.!?])\s+', text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            # Check if adding this sentence would exceed max length using grapheme-aware length
            sentence_grapheme_length = grapheme.length(sentence)
            current_chunk_grapheme_length = grapheme.length(current_chunk)
            
            if current_chunk_grapheme_length + sentence_grapheme_length + 1 > max_chunk_length:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # If the sentence itself is longer than max_chunk_length, 
                # break it at word boundaries while respecting grapheme clusters
                if sentence_grapheme_length > max_chunk_length:
                    words = sentence.split()
                    temp_chunk = ""
                    for word in words:
                        word_grapheme_length = grapheme.length(word)
                        temp_chunk_grapheme_length = grapheme.length(temp_chunk)
                        
                        if temp_chunk_grapheme_length + word_grapheme_length + 1 > max_chunk_length:
                            chunks.append(temp_chunk.strip())
                            temp_chunk = word + " "
                        else:
                            temp_chunk += word + " "
                    
                    if temp_chunk:
                        current_chunk = temp_chunk
                else:
                    current_chunk = sentence + " "
            else:
                current_chunk += sentence + " "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # Verify no chunk exceeds the maximum length in graphemes
        for i, chunk in enumerate(chunks):
            chunk_len = grapheme.length(chunk)
            if chunk_len > max_chunk_length:
                print(f"Warning: Chunk {i} has {chunk_len} graphemes, which exceeds the maximum of {max_chunk_length}")
        
        return chunks

    try:
        # Generate title audio
        if title_intro_script and title_intro_script.strip():
            print("Generating Hindi title audio...")
            title_audio_path = os.path.join(output_dir, "00_title_introduction.wav")
            
            cleaned_text = title_intro_script
            if cleaned_text:
                # Get Hindi chunks capped at 490 characters
                hindi_chunks = chunk_hindi_text(cleaned_text)
                print(f"Processing {len(hindi_chunks)} Hindi chunks for title intro")
                # Create temporary directory for chunk files
                temp_dir = os.path.join(output_dir, "temp_chunks")
                Path(temp_dir).mkdir(exist_ok=True)
                
                chunk_files = []
                for j, chunk in enumerate(hindi_chunks):
                    chunk_path = os.path.join(temp_dir, f"00_title_introduction_chunk_{j:03d}.wav")
                    print(f"  Processing chunk {j+1}/{len(hindi_chunks)} ({len(chunk)} chars)")
                    
                    # Use synthesize_text directly instead of synthesize_long_text
                    try:
                        audio_bytes = tts_client.synthesize_text(
                            text=chunk,
                            voice=voice
                        )
                        
                        if audio_bytes and len(audio_bytes) > 0:
                            # Write the audio bytes directly to file
                            with open(chunk_path, 'wb') as f:
                                f.write(audio_bytes)
                            chunk_files.append(chunk_path)
                            print(f"  ✓ Generated audio for chunk {j+1}")
                        else:
                            print(f"  ⨯ No audio data returned for chunk {j+1}")
                    except Exception as e:
                        print(f"  ⨯ Error generating audio for chunk {j+1}: {e}")
                
                # If we have generated chunks, combine them
                if chunk_files:
                    # Use ffmpeg to concatenate the audio files
                    # Create a file list for ffmpeg
                    list_file = os.path.join(temp_dir, "00_title_introduction_list.txt")
                    with open(list_file, 'w') as f:
                        for chunk_file in chunk_files:
                            f.write(f"file '{os.path.abspath(chunk_file)}'\n")
                    
                    # Use ffmpeg to concatenate
                    try:
                        subprocess.run([
                            'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
                            '-i', list_file, '-c', 'copy', title_audio_path
                        ], check=True, capture_output=True)
                        
                        audio_files.append(title_audio_path)
                        successful_generations += 1
                        print(f"✓ Title Hindi audio: {title_audio_path}")
                    except subprocess.CalledProcessError as e:
                        print(f"FFmpeg error: {e.stderr.decode() if e.stderr else e}")
                        # If ffmpeg fails, use the first chunk as fallback
                        if chunk_files:
                            import shutil
                            shutil.copy(chunk_files[0], title_audio_path)
                            audio_files.append(title_audio_path)
                            successful_generations += 1
                            print(f"⚠ Title Hindi audio (fallback): {title_audio_path}")

        # Generate section audios
        section_order = ["Introduction", "Methodology", "Results", "Discussion", "Conclusion"]
        
        for i, section_name in enumerate(section_order, start=1):
            if section_name in sections_scripts:
                script_text = sections_scripts[section_name]
                
                if not script_text or not script_text.strip():
                    continue

                print(f"Generating Hindi {section_name} audio...")
                audio_path = os.path.join(output_dir, f"{i:02d}_{section_name.lower()}.wav")
                
                cleaned_text = script_text
                if cleaned_text:
                    # Get Hindi chunks capped at 490 characters
                    hindi_chunks = chunk_hindi_text(cleaned_text)
                    print(f"Processing {len(hindi_chunks)} Hindi chunks for {section_name}")
                    # Create temporary directory for chunk files
                    temp_dir = os.path.join(output_dir, "temp_chunks")
                    Path(temp_dir).mkdir(exist_ok=True)
                    
                    chunk_files = []
                    for j, chunk in enumerate(hindi_chunks):
                        chunk_path = os.path.join(temp_dir, f"{i:02d}_{section_name.lower()}_chunk_{j:03d}.wav")
                        print(f"  Processing chunk {j+1}/{len(hindi_chunks)} ({len(chunk)} chars)")
                        
                        # Use synthesize_text directly instead of synthesize_long_text
                        try:
                            audio_bytes = tts_client.synthesize_text(
                                text=chunk,
                                voice=voice
                            )
                            
                            if audio_bytes and len(audio_bytes) > 0:
                                # Write the audio bytes directly to file
                                with open(chunk_path, 'wb') as f:
                                    f.write(audio_bytes)
                                chunk_files.append(chunk_path)
                                print(f"  ✓ Generated audio for chunk {j+1}")
                            else:
                                print(f"  ⨯ No audio data returned for chunk {j+1}")
                        except Exception as e:
                            print(f"  ⨯ Error generating audio for chunk {j+1}: {e}")
                    
                    # If we have generated chunks, combine them
                    if chunk_files:
                        # Use ffmpeg to concatenate the audio files
                        # Create a file list for ffmpeg
                        list_file = os.path.join(temp_dir, f"{i:02d}_{section_name.lower()}_list.txt")
                        with open(list_file, 'w') as f:
                            for chunk_file in chunk_files:
                                f.write(f"file '{os.path.abspath(chunk_file)}'\n")
                        
                        # Use ffmpeg to concatenate
                        try:
                            subprocess.run([
                                'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
                                '-i', list_file, '-c', 'copy', audio_path
                            ], check=True, capture_output=True)
                            
                            audio_files.append(audio_path)
                            successful_generations += 1
                            print(f"✓ {section_name} Hindi audio: {audio_path}")
                        except subprocess.CalledProcessError as e:
                            print(f"FFmpeg error: {e.stderr.decode() if e.stderr else e}")
                            # If ffmpeg fails, use the first chunk as fallback
                            if chunk_files:
                                import shutil
                                shutil.copy(chunk_files[0], audio_path)
                                audio_files.append(audio_path)
                                successful_generations += 1
                                print(f"⚠ {section_name} Hindi audio (fallback): {audio_path}")

        if successful_generations == 0:
            raise ValueError("No Hindi audio files were generated successfully")

        print(f"✓ Generated {successful_generations} Hindi audio files")
        
        # Clean up temp files if needed
        # shutil.rmtree(temp_dir, ignore_errors=True)
        
        return {
            "audio_files": [Path(f).name for f in audio_files]
        }

    except Exception as e:
        print(f"Hindi audio generation error: {e}")
        raise


def test_sarvam_sdk(api_key: str, voice: str = "meera"):
    """Test function for SDK validation"""
    try:
        tts_client = SarvamTTS(api_key=api_key)
        return tts_client.test_connection()
    except Exception as e:
        print(f"SDK test failed: {e}")
        return False
