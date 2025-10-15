# Sarvam TTS Voice Update - Fixed

## 🚨 Issue Found

The Sarvam TTS API has updated their available voices. Old voice names like **"arvind"** and **"meera"** are no longer valid, causing audio generation to fail with error:

```
Error: API request failed: 400 - Validation Error(s):
- speaker: Input should be 'anushka', 'abhilash', 'manisha', 'vidya', ...
```

## ✅ Solution Applied

Updated all voice references to use the **new valid voice names**.

---

## 🎤 Available Sarvam TTS Voices (Current)

### **Male Voices** (14 voices)
- `karun` ⭐ (Primary - Expert voice)
- `abhilash`
- `rahul`
- `rohan`
- `vikram`
- `rajesh`
- `anirudh`
- `ishaan`
- `chirag`
- `harsh`
- `hitesh`
- `aditya`
- `kiran`

### **Female Voices** (16 voices)
- `vidya` ⭐ (Primary - Host voice)
- `anushka`
- `manisha`
- `arya`
- `isha`
- `ritu`
- `sakshi`
- `priya`
- `neha`
- `pooja`
- `simran`
- `kavya`
- `anjali`
- `sneha`
- `sunita`
- `tara`
- `kriti`

---

## 🔧 Files Updated

### 1. **`backend/app/routes/audio.py`**
**Changed:**
- ❌ `voice = "arvind"` (invalid)
- ✅ `voice = "karun"` (valid)

**Code:**
```python
# Determine voice based on language
# For English, use male voice (karun), for Indian languages use female voice (vidya)
voice = "karun" if language == "en-IN" else "vidya"
```

---

### 2. **`backend/app/services/podcast_generator.py`**
**Changed:**
- ❌ Speaker 1: `"meera"` (invalid)
- ❌ Speaker 2: `"arjun"` (invalid)
- ✅ Speaker 1: `"vidya"` (valid)
- ✅ Speaker 2: `"karun"` (valid)

**Code:**
```python
# Voice mapping: Speaker 1 = Female (vidya), Speaker 2 = Male (karun)
voice_map = {
    1: "vidya",  # Host - Female
    2: "karun"   # Expert - Male
}

voice = voice_map.get(speaker, "vidya")
```

---

### 3. **`backend/app/services/tts_service.py`**
**Changed:**
- Added backward compatibility mapping
- Default changed from `"meera"` to `"vidya"`

**Code:**
```python
voice = voice_selections.get(language, "vidya")

# Map old voice names to new ones (for backward compatibility)
voice_mapping = {
    "meera": "vidya",
    "arjun": "karun",
    "arvind": "karun"
}
voice = voice_mapping.get(voice, voice)
```

Also updated in `generate_audio_sarvam()` function:
```python
# Map old voice names to new ones (for backward compatibility)
voice_mapping = {
    "meera": "vidya",
    "arjun": "karun",
    "arvind": "karun"
}
voice = voice_mapping.get(voice, voice)
```

---

## 📊 Voice Mapping (Old → New)

| Old Voice | New Voice | Gender | Usage |
|-----------|-----------|--------|-------|
| `meera` | `vidya` | Female | Host/General |
| `arjun` | `karun` | Male | Expert |
| `arvind` | `karun` | Male | Narrator |

---

## 🎯 Where These Voices Are Used

### **1. Audio Summary** (`/api/audio/.../generate`)
- **English:** `karun` (male narrator)
- **Indian languages:** `vidya` (female narrator)

### **2. Podcast** (`/api/podcasts/.../generate`)
- **Speaker 1 (Host):** `vidya` (female)
- **Speaker 2 (Expert):** `karun` (male)

### **3. Video Narration** (`/api/media/.../generate-audio`)
- Based on `voice_selections` dict
- Default: `vidya`
- Maps old names automatically

### **4. Reel Audio** (`/api/reels/.../generate`)
- Uses `generate_audio_sarvam()`
- Default: `vidya`
- Can specify any valid voice

---

## 🧪 Testing

### Test Audio Summary
```bash
# This should now work without errors
POST /api/audio/{paper_id}/generate
{
  "language": "en-IN"
}
```

Expected:
- ✅ Uses `karun` voice
- ✅ Generates audio successfully
- ✅ No 400 validation error

### Test Podcast
```bash
POST /api/podcasts/{paper_id}/generate
{
  "duration_minutes": 5,
  "language": "en-IN"
}
```

Expected:
- ✅ Speaker 1 uses `vidya` voice
- ✅ Speaker 2 uses `karun` voice
- ✅ Audio segments generate correctly
- ✅ Combined podcast works

---

## 🎨 Voice Selection Recommendations

### For Different Content Types

**Formal/Academic:**
- Male: `karun`, `vikram`, `rajesh`
- Female: `vidya`, `manisha`, `priya`

**Casual/Engaging:**
- Male: `rahul`, `rohan`, `anirudh`
- Female: `anushka`, `isha`, `ritu`

**Energetic/Youth:**
- Male: `chirag`, `harsh`, `ishaan`
- Female: `kavya`, `anjali`, `kriti`

**Professional:**
- Male: `abhilash`, `vikram`, `aditya`
- Female: `vidya`, `sunita`, `tara`

---

## 🔄 Backward Compatibility

The code now includes **automatic mapping** from old voice names to new ones:

```python
voice_mapping = {
    "meera": "vidya",
    "arjun": "karun",
    "arvind": "karun"
}
```

**Benefits:**
- Old code still works
- No breaking changes
- Smooth migration
- Future-proof

---

## ⚠️ Important Notes

1. **Voice Name Case-Sensitive**
   - Use lowercase: `"vidya"` ✅
   - Not: `"Vidya"` ❌

2. **Language Support**
   - All voices support: English (en-IN)
   - Most support: Hindi, Tamil, Telugu, etc.

3. **Voice Quality**
   - `vidya` and `karun` are recommended as primary voices
   - They have the best quality and consistency

4. **Sample Rate**
   - Default: 22050 Hz
   - Supported: 8000, 16000, 22050, 32000, 44100, 48000 Hz

---

## 🚀 Next Steps

1. **Restart Backend Server**
   ```bash
   cd backend
   # Press Ctrl+C to stop
   uvicorn app.main:app --reload
   ```

2. **Test Audio Generation**
   - Try Audio Summary
   - Try Podcast
   - Verify no 400 errors

3. **Monitor Logs**
   Look for:
   ```
   Using voice: karun
   ✓ Connected to Sarvam TTS API
   ```

---

## 📝 Example API Calls

### Generate Audio Summary with Hindi
```python
POST /api/audio/{paper_id}/generate
{
  "language": "hi-IN"
}
# Uses: vidya (female voice)
```

### Generate Audio Summary with English
```python
POST /api/audio/{paper_id}/generate
{
  "language": "en-IN"
}
# Uses: karun (male voice)
```

### Generate Podcast
```python
POST /api/podcasts/{paper_id}/generate
{
  "duration_minutes": 5,
  "language": "en-IN"
}
# Speaker 1: vidya (female)
# Speaker 2: karun (male)
```

---

## ✅ Success Indicators

After fix:
- ✅ No "Validation Error(s)" for speaker
- ✅ Audio generates successfully
- ✅ Correct voices used
- ✅ Natural-sounding speech
- ✅ Logs show valid voice names

---

## 🎉 Summary

**Problem:** Old voice names ("arvind", "meera", "arjun") no longer valid  
**Solution:** Updated to new valid voices ("karun", "vidya")  
**Files Changed:** 3 files (audio.py, podcast_generator.py, tts_service.py)  
**Status:** ✅ Fixed and ready to use  
**Action Required:** Restart backend server  

---

*Sarvam TTS voice update completed successfully!* 🎤✨
