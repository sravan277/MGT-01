# Audio Route Import Fix

## ❌ Error
```
ImportError: cannot import name 'generate_audio_from_text' from 'app.services.tts_service'
```

## ✅ Solution

### Issue
The function name in `tts_service.py` is `generate_audio_sarvam`, not `generate_audio_from_text`.

### Fix Applied

**File: `backend/app/routes/audio.py`**

**Before:**
```python
from app.services.tts_service import generate_audio_from_text

# ...

generate_audio_from_text(
    text=summary,
    output_path=str(audio_path),
    api_key=api_keys["sarvam_key"],
    language_code=language,
    speaker="arvind" if language == "en-IN" else "meera"
)
```

**After:**
```python
from app.services.tts_service import generate_audio_sarvam

# ...

# Determine voice based on language
# For English, use male voice (arvind/karun), for Indian languages use female voice (meera/vidya)
voice = "arvind" if language == "en-IN" else "meera"

generate_audio_sarvam(
    text=summary,
    output_path=str(audio_path),
    api_key=api_keys["sarvam_key"],
    language_code=language,
    voice=voice
)
```

### Changes Made
1. ✅ Changed import from `generate_audio_from_text` to `generate_audio_sarvam`
2. ✅ Changed parameter from `speaker` to `voice`
3. ✅ Added comment explaining voice selection logic

### Function Signature
```python
def generate_audio_sarvam(
    text: str,
    output_path: str,
    api_key: str,
    language_code: str = "en-IN",
    voice: str = "meera"
) -> str
```

### Voice Mapping
The `tts_service.py` automatically maps voices:
- `"meera"` → `"vidya"` (female voice)
- `"arvind"` → `"karun"` (male voice)

### Voice Selection Logic
- **English (en-IN)**: Uses `"arvind"` (male voice)
- **Other Indian languages**: Uses `"meera"` (female voice)

## ✅ Status
Import error fixed. Backend should now start successfully.

## 🧪 Test
```bash
cd backend
uvicorn app.main:app --reload
```

Should start without import errors.
