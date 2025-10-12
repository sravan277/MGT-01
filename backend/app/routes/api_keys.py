from fastapi import APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
import os
from app.auth.dependencies import get_current_user
from app.models.request_models import APIKeysRequest

router = APIRouter()

# Load environment variables from .env file
load_dotenv()
# env_vars = dotenv_values()

# In-memory storage for API keys (use secure storage in production)
api_keys_storage = {}

@router.post("/setup")
async def setup_api_keys(request: APIKeysRequest):
    """Store API keys securely."""

    # Always try to set Gemini key, fallback to .env if not provided
    gemini_key = (request.gemini_key or "").strip() or os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            model.generate_content("Hello")
            api_keys_storage["gemini_key"] = gemini_key
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid Gemini API key: {str(e)}")

    # Always try to set Sarvam key, fallback to .env if not provided
    sarvam_key = (request.sarvam_key or "").strip() or os.getenv("SARVAM_API_KEY")
    if sarvam_key:
        api_keys_storage["sarvam_key"] = sarvam_key

    if request.openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=request.openai_key)
            client.models.list()
            api_keys_storage["openai_key"] = request.openai_key
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid OpenAI API key: {str(e)}")

    return {"message": "API keys configured successfully"}

@router.get("/status")
async def get_api_keys_status():
    """Get status of configured API keys."""

    return {
        "gemini_configured": "gemini_key" in api_keys_storage or bool(os.getenv("GEMINI_API_KEY")),
        "sarvam_configured": "sarvam_key" in api_keys_storage or bool(os.getenv("SARVAM_API_KEY")),
        "openai_configured": "openai_key" in api_keys_storage
    }

def get_api_keys():
    # Always try to fallback to .env for Sarvam key if not set
    if "sarvam_key" not in api_keys_storage or not api_keys_storage["sarvam_key"]:
        sarvam_key = os.getenv("SARVAM_API_KEY")
        if sarvam_key:
            api_keys_storage["sarvam_key"] = sarvam_key

    # If Gemini key already in storage, use it
    if "gemini_key" in api_keys_storage and api_keys_storage["gemini_key"]:
        return api_keys_storage

    # Handle multiple Gemini keys: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...
    gemini_keys = []
    i = 1
    while True:
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            gemini_keys.append(key)
            i += 1
        else:
            break
    # Fallback to GEMINI_API_KEY if no numbered keys found
    if not gemini_keys:
        key = os.getenv("GEMINI_API_KEY")
        if key:
            gemini_keys.append(key)

    # If we have any Gemini keys, use the first one without validation
    if gemini_keys:
        api_keys_storage["gemini_key"] = gemini_keys[0]
        return api_keys_storage

    # No Gemini key found at all
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No Gemini API key found. Please check your .env file or setup API keys."
    )