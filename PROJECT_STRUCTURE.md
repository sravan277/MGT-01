# SARAL - Project Folder Structure

## 📁 Complete Directory Tree

```
SARAL/
│
├── 📄 .gitignore                        # Git ignore rules
├── 📄 LICENSE                           # Project license
├── 📄 README.md                         # Main project documentation
├── 📄 CHATBOT_UPDATES.md               # Chatbot feature updates log
├── 📄 IMPLEMENTATION_SUMMARY.md        # Implementation details
├── 📄 chats.txt                        # Chat logs
├── 📄 tutorial.pdf                     # Tutorial document
├── 📄 videoplayback.mp4                # Sample video file
│
├── 📂 backend/                         # Backend server (FastAPI)
│   │
│   ├── 📄 .env                         # Environment variables (API keys, secrets)
│   ├── 📄 .python-version              # Python version specification
│   ├── 📄 requirements.txt             # Python dependencies
│   │
│   ├── 📂 .venv/                       # Python virtual environment
│   ├── 📂 temp/                        # Temporary files storage
│   │
│   └── 📂 app/                         # Main application directory
│       │
│       ├── 📄 __init__.py              # Package initializer
│       ├── 📄 main.py                  # FastAPI application entry point
│       │
│       ├── 📂 auth/                    # Authentication & Authorization
│       │   ├── 📄 decorators.py        # Auth decorators
│       │   ├── 📄 dependencies.py      # Auth dependencies
│       │   └── 📄 google_auth.py       # Google OAuth integration
│       │
│       ├── 📂 dependencies/            # Shared dependencies
│       │   └── 📄 session.py           # Session management
│       │
│       ├── 📂 models/                  # Data models
│       │   └── 📄 request_models.py    # Pydantic request models
│       │
│       ├── 📂 routes/                  # API endpoints
│       │   ├── 📄 api_keys.py          # API key management routes
│       │   ├── 📄 auth.py              # Authentication routes
│       │   ├── 📄 chatbot.py           # ✨ AI Chatbot endpoints
│       │   ├── 📄 images.py            # Image handling routes
│       │   ├── 📄 media.py             # Media generation routes
│       │   ├── 📄 papers.py            # Paper management routes
│       │   ├── 📄 podcasts.py          # Podcast generation routes
│       │   ├── 📄 posters.py           # Poster generation routes
│       │   ├── 📄 reels.py             # Reel generation routes
│       │   ├── 📄 scripts.py           # Script generation routes
│       │   └── 📄 slides.py            # Slide creation routes
│       │
│       ├── 📂 services/                # Business logic & AI services
│       │   ├── 📄 arxiv_scraper.py     # ArXiv paper scraping
│       │   ├── 📄 auth_service.py      # Authentication service
│       │   ├── 📄 beamer_generator.py  # LaTeX Beamer slide generator
│       │   ├── 📄 chatbot_service.py   # ✨ AI Chatbot service (Gemini)
│       │   ├── 📄 hindi_service.py     # Hindi language support
│       │   ├── 📄 language_service.py  # Multi-language processing
│       │   ├── 📄 latex_processor.py   # LaTeX file processing
│       │   ├── 📄 pdf_processor.py     # PDF extraction & processing
│       │   ├── 📄 podcast_generator.py # Podcast audio generation
│       │   ├── 📄 poster_generator.py  # Research poster generation
│       │   ├── 📄 reel_generator.py    # Short video reel generation
│       │   ├── 📄 sarvam_sdk.py        # Sarvam AI SDK integration
│       │   ├── 📄 script_generator.py  # Video script generation
│       │   ├── 📄 session_manager.py   # Session state management
│       │   ├── 📄 storage_manager.py   # File storage management
│       │   ├── 📄 tts_service.py       # Text-to-Speech service
│       │   └── 📄 video_service.py     # Video processing service
│       │
│       └── 📂 utils/                   # Utility functions
│           └── 📄 latex_to_images.py   # LaTeX to image conversion
│
└── 📂 frontend/                        # Frontend application (React)
    │
    ├── 📄 .env                         # Frontend environment variables
    ├── 📄 README.md                    # Frontend documentation
    ├── 📄 package.json                 # Node.js dependencies
    ├── 📄 package-lock.json            # Locked dependency versions
    ├── 📄 tailwind.config.js           # TailwindCSS configuration
    │
    ├── 📂 dist/                        # Production build output
    ├── 📂 node_modules/                # Node.js packages
    │
    ├── 📂 public/                      # Static public files
    │   ├── 📄 favicon.ico              # Favicon
    │   ├── 📄 index.html               # HTML template
    │   ├── 📄 logo192.png              # Logo (192x192)
    │   ├── 📄 logo512.png              # Logo (512x512)
    │   ├── 📄 manifest.json            # PWA manifest
    │   ├── 📄 robots.txt               # Robots crawler rules
    │   └── 📂 frames/                  # Frame assets
    │
    └── 📂 src/                         # Source code
        │
        ├── 📄 index.js                 # Application entry point
        ├── 📄 App.js                   # Main App component
        ├── 📄 App.css                  # App styles
        ├── 📄 index.css                # Global styles
        ├── 📄 logo.svg                 # Logo SVG
        ├── 📄 reportWebVitals.js       # Performance monitoring
        ├── 📄 setupTests.js            # Test configuration
        ├── 📄 App.test.js              # App tests
        │
        ├── 📂 components/              # React components
        │   │
        │   ├── 📂 auth/                # Authentication components
        │   │   └── 📄 AuthGuard.jsx    # Protected route wrapper
        │   │
        │   ├── 📂 chatbot/             # ✨ AI Chatbot components
        │   │   ├── 📄 ChatbotButton.jsx    # Floating chatbot button
        │   │   └── 📄 PaperChatbot.jsx     # Main chatbot interface
        │   │
        │   ├── 📂 common/              # Shared common components
        │   │   ├── 📄 ContinueButton.jsx   # Continue button
        │   │   ├── 📄 ErrorBoundary.jsx    # Error handling boundary
        │   │   ├── 📄 FilePreview.jsx      # File preview component
        │   │   ├── 📄 Layout.jsx           # Page layout wrapper
        │   │   ├── 📄 LoadingSpinner.jsx   # Loading indicator
        │   │   ├── 📄 Pagination.jsx       # Pagination component
        │   │   ├── 📄 ProtectedRoute.jsx   # Route protection
        │   │   └── 📄 ThemeToggle.jsx      # Dark/Light mode toggle
        │   │
        │   ├── 📂 forms/               # Form components
        │   │   ├── 📄 MetadataEditor.jsx   # Paper metadata editor
        │   │   └── 📄 PaperUpload.jsx      # Paper upload form
        │   │
        │   ├── 📂 navigation/          # Navigation components
        │   │   ├── 📄 Breadcrumbs.jsx      # Breadcrumb navigation
        │   │   ├── 📄 Header.jsx           # App header
        │   │   └── 📄 Sidebar.jsx          # Sidebar navigation
        │   │
        │   └── 📂 workflow/            # Workflow components
        │       ├── 📄 GeneratedVideoDisplay.jsx  # Video display
        │       ├── 📄 ImageSelector.jsx          # Image selection
        │       └── 📄 VideoPlayer.jsx            # Video player
        │
        ├── 📂 contexts/                # React Context API
        │   ├── 📄 ApiContext.jsx       # API configuration context
        │   ├── 📄 AuthContext.jsx      # Authentication context
        │   ├── 📄 ThemeContext.jsx     # Theme (dark/light) context
        │   └── 📄 WorkflowContext.jsx  # Workflow state context
        │
        ├── 📂 hooks/                   # Custom React hooks
        │   ├── 📄 useApi.js            # API call hook
        │   ├── 📄 useLocalStorage.js   # Local storage hook
        │   ├── 📄 usePagination.js     # Pagination logic hook
        │   └── 📄 useResponsive.js     # Responsive design hook
        │
        ├── 📂 images/                  # Image assets
        │
        ├── 📂 pages/                   # Page components
        │   ├── 📄 About.jsx            # About page
        │   ├── 📄 ApiSetup.jsx         # API configuration page
        │   ├── 📄 ApiSetupForm.jsx     # API setup form
        │   ├── 📄 Dashboard.jsx        # Main dashboard
        │   ├── 📄 LandingPage.jsx      # Landing/home page
        │   ├── 📄 Login.jsx            # Login page
        │   ├── 📄 MediaGeneration.jsx  # Media generation page
        │   ├── 📄 OutputSelection.jsx  # Output selection page (✨ Chatbot integrated)
        │   ├── 📄 PaperProcessing.jsx  # Paper processing page
        │   ├── 📄 PodcastGeneration.jsx # Podcast generation page
        │   ├── 📄 PosterGeneration.jsx  # Poster generation page
        │   ├── 📄 ReelGeneration.jsx    # Reel generation page
        │   ├── 📄 Results.jsx           # Results display page
        │   ├── 📄 ScriptGeneration.jsx  # Script generation page
        │   ├── 📄 SlideCreation.jsx     # Slide creation page
        │   └── 📄 VideosPage.jsx        # Videos library page
        │
        ├── 📂 services/                # API service layer
        │   └── 📄 api.js               # Axios API client & endpoints
        │
        ├── 📂 styles/                  # Style files
        │   └── 📄 globals.css          # Global CSS styles
        │
        └── 📂 utils/                   # Utility functions
            ├── 📄 constants.js         # App constants
            ├── 📄 helpers.js           # Helper functions
            └── 📄 mediaUtils.js        # Media processing utilities
```

## 📊 Project Statistics

### Backend
- **Total Routes**: 11 API route modules
- **Total Services**: 17 service modules
- **Authentication**: Google OAuth + JWT
- **Main Technologies**: FastAPI, Python, Google Gemini AI

### Frontend
- **Total Pages**: 16 page components
- **Total Components**: 30+ reusable components
- **State Management**: React Context API (4 contexts)
- **Custom Hooks**: 4 hooks
- **Main Technologies**: React, TailwindCSS, Axios

## 🎯 Key Features by Module

### Backend Services
1. **AI/ML Services**
   - `chatbot_service.py` - AI chatbot with Gemini
   - `script_generator.py` - AI script generation
   - `podcast_generator.py` - Audio podcast generation
   - `tts_service.py` - Text-to-speech conversion

2. **Content Generation**
   - `poster_generator.py` - Research poster creation
   - `reel_generator.py` - Short video reels
   - `beamer_generator.py` - LaTeX presentation slides
   - `video_service.py` - Video processing

3. **Processing Services**
   - `pdf_processor.py` - PDF text extraction
   - `latex_processor.py` - LaTeX processing
   - `language_service.py` - Multi-language support
   - `hindi_service.py` - Hindi language processing

4. **External Integrations**
   - `arxiv_scraper.py` - ArXiv paper scraping
   - `sarvam_sdk.py` - Sarvam AI integration
   - `google_auth.py` - Google authentication

### Frontend Pages
1. **Core Workflow**
   - `LandingPage.jsx` - Entry point
   - `Dashboard.jsx` - User dashboard
   - `PaperProcessing.jsx` - Paper upload/processing
   - `OutputSelection.jsx` - Select output types (with chatbot ✨)

2. **Generation Pages**
   - `ScriptGeneration.jsx` - Generate video scripts
   - `SlideCreation.jsx` - Create presentation slides
   - `PosterGeneration.jsx` - Generate research posters
   - `ReelGeneration.jsx` - Create short video reels
   - `PodcastGeneration.jsx` - Generate podcasts
   - `MediaGeneration.jsx` - General media generation

3. **Configuration**
   - `ApiSetup.jsx` - Configure API keys
   - `Login.jsx` - User authentication
   - `Results.jsx` - View generated content

### Frontend Components
1. **Navigation**
   - Header with user menu
   - Sidebar with workflow steps
   - Breadcrumb navigation

2. **Chatbot** ✨
   - Floating chatbot button
   - Interactive chat interface
   - Quiz generation
   - Auto-suggestions

3. **Common**
   - Loading spinners
   - Error boundaries
   - File previews
   - Theme toggle (dark/light mode)

4. **Workflow**
   - Video player
   - Image selector
   - Generated content display

## 🔧 Configuration Files

### Backend
- `.env` - Environment variables (API keys, secrets)
- `requirements.txt` - Python dependencies
- `.python-version` - Python version

### Frontend
- `.env` - Frontend environment variables
- `package.json` - Node.js dependencies
- `tailwind.config.js` - TailwindCSS configuration

## 🗃️ Data Flow

```
User Upload (PDF/LaTeX)
    ↓
Backend Processing (pdf_processor/latex_processor)
    ↓
Storage (storage_manager)
    ↓
AI Generation (script/poster/reel/podcast generators)
    ↓
Frontend Display (Pages)
    ↓
User Interaction (Chatbot, Downloads, etc.)
```

## 🚀 Entry Points

### Backend
- **Main**: `backend/app/main.py`
- **Run**: `uvicorn app.main:app --reload`

### Frontend
- **Main**: `frontend/src/index.js`
- **Run**: `npm start`

## 📝 Notes

- All API routes prefixed with `/api/`
- Chatbot integrated on `OutputSelection.jsx` page
- Uses Google Gemini for AI features
- Supports dark/light themes
- Mobile-responsive design
- Google OAuth authentication
- Multi-language support (including Hindi)

---

**Project Type**: Research Paper to Media Generation Platform  
**Architecture**: Monorepo (Backend + Frontend)  
**Status**: Production-ready with AI Chatbot ✨
