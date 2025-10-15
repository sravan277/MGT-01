# SARAL - Visual Workflow Diagram

## 🎯 Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SARAL PLATFORM                              │
│              Research Paper to Multi-Media Converter                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 0: LANDING PAGE (/)                                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Welcome message                                                   │
│  • Feature overview                                                  │
│  • "Get Started" button                                             │
│  • Public access (no login required)                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                         [User clicks Get Started]
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: API SETUP (/api-setup) 🔐                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Required:                                                           │
│  ✅ Google Gemini API Key                                           │
│                                                                      │
│  Optional:                                                           │
│  🔧 Sarvam TTS API Key (for Indian languages)                       │
│                                                                      │
│  Actions:                                                            │
│  • Test connection                                                   │
│  • Save keys to session                                             │
│  • Continue button enabled after validation                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                          [Keys validated ✓]
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: PAPER PROCESSING (/paper-processing) 📄                   │
├─────────────────────────────────────────────────────────────────────┤
│  Upload Options:                                                     │
│                                                                      │
│  Option A: arXiv Import                                             │
│  • Enter arXiv URL                                                   │
│  • System downloads paper                                           │
│  • Extracts LaTeX/PDF                                               │
│                                                                      │
│  Option B: LaTeX Upload                                             │
│  • Upload ZIP file                                                   │
│  • Must contain .tex files                                          │
│  • Images automatically extracted                                   │
│                                                                      │
│  Processing:                                                         │
│  → Extract text content                                             │
│  → Parse structure                                                   │
│  → Extract figures/images                                           │
│  → Generate metadata                                                │
│                                                                      │
│  Metadata Editor:                                                    │
│  • Title (editable)                                                  │
│  • Authors (editable)                                               │
│  • Date (editable)                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                      [Paper uploaded & processed ✓]
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: OUTPUT SELECTION (/output-selection) 🎯                   │
├─────────────────────────────────────────────────────────────────────┤
│  Choose Output Format:                                               │
│                                                                      │
│  📄 PDF Generation          → Script → Slides → PDF                 │
│  🎬 Video Generation        → Script → Slides → Audio → Video       │
│  🖼️  AI Poster              → Extract → Layout → PDF/PNG            │
│  🎥 AI Reel                 → Highlights → Quick Video (30-60s)     │
│  🎙️  Podcast                → Dialogue → 2-Speaker Audio (5-15m)    │
│  🎧 Audio Summary           → Summary → 1-Speaker Audio (2-3m)      │
│                                                                      │
│  🤖 AI CHATBOT (Floating button on this page)                       │
│  • Ask questions about paper                                        │
│  • Generate quiz (5 questions)                                      │
│  • Get suggested questions                                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    [User selects output format]
                                   ▼
        ┌──────────────┬──────────────┬──────────────┬──────────────┐
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
   VIDEO/PDF      POSTER         REEL          PODCAST      AUDIO SUMMARY
     FLOW          FLOW           FLOW           FLOW            FLOW
        │              │              │              │              │
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼

═══════════════════════════════════════════════════════════════════════
VIDEO/PDF GENERATION FLOW (Main Workflow)
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: SCRIPT GENERATION (/script-generation) ✍️                  │
├─────────────────────────────────────────────────────────────────────┤
│  AI Process:                                                         │
│  1. Analyze paper structure                                         │
│  2. Generate narration scripts per section                          │
│  3. Optimize for spoken audio                                       │
│                                                                      │
│  UI Features:                                                        │
│  • Title/Introduction script                                        │
│  • Section scripts (editable)                                       │
│  • Conclusion script                                                │
│  • Character count                                                   │
│  • Regenerate button                                                │
│  • Language: English/Hindi                                          │
│                                                                      │
│  User Actions:                                                       │
│  • Review AI-generated scripts                                      │
│  • Edit content                                                      │
│  • Save changes                                                      │
│  • Continue                                                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                      [Scripts finalized ✓]
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: SLIDE CREATION (/slide-creation) 📊                       │
├─────────────────────────────────────────────────────────────────────┤
│  Slide Components:                                                   │
│  • Bullet points (AI-generated)                                     │
│  • Images (user-selected)                                           │
│  • Section titles                                                    │
│                                                                      │
│  Image Selector:                                                     │
│  • View all extracted images                                        │
│  • Click to assign to section                                       │
│  • Visual selection indicator                                       │
│  • Preview layout                                                    │
│                                                                      │
│  Slide Generation:                                                   │
│  1. Combine bullet points + images                                  │
│  2. Generate LaTeX Beamer                                           │
│  3. Compile to PDF                                                  │
│  4. Extract slide images                                            │
│                                                                      │
│  Output:                                                             │
│  • PDF slides (downloadable)                                        │
│  • Individual slide images                                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                        [Slides created ✓]
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: MEDIA GENERATION (/media-generation) 🎬                   │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 1: AUDIO GENERATION                                          │
│  ───────────────────────────────                                    │
│  1. Split scripts into chunks                                       │
│  2. Send to Sarvam TTS API                                          │
│  3. Generate WAV files per section                                  │
│  4. Concatenate audio                                               │
│  5. Calculate timestamps                                            │
│                                                                      │
│  Duration: 1-2 minutes                                              │
│  Output: Combined WAV file                                          │
│                                                                      │
│  ─────────────────────────────────────────────────────              │
│  Phase 2: VIDEO GENERATION                                          │
│  ───────────────────────────────                                    │
│  1. Convert PDF slides → PNG images                                 │
│  2. Match audio to slide timestamps                                 │
│  3. FFmpeg processing:                                              │
│     • Combine slides + audio                                        │
│     • Add transitions                                               │
│     • Set timing                                                     │
│  4. Export MP4 video                                                │
│                                                                      │
│  Duration: 3-5 minutes                                              │
│  Output: MP4 video file                                             │
│                                                                      │
│  UI Features:                                                        │
│  • Progress indicators                                              │
│  • Audio player (preview)                                           │
│  • Video player (preview)                                           │
│  • Download buttons                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                        [Video ready ✓]
                                   ▼

═══════════════════════════════════════════════════════════════════════
POSTER GENERATION FLOW
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  POSTER GENERATION (/poster-generation) 🖼️                          │
├─────────────────────────────────────────────────────────────────────┤
│  Process:                                                            │
│  1. AI analyzes paper structure                                     │
│  2. Extracts key sections:                                          │
│     • Title & Authors                                               │
│     • Abstract                                                       │
│     • Methodology                                                    │
│     • Results                                                        │
│     • Conclusion                                                     │
│  3. Selects 3-5 key figures                                         │
│  4. Generates LaTeX poster                                          │
│  5. Compiles to PDF/PNG                                             │
│                                                                      │
│  Customization:                                                      │
│  • Layout (Classic/Modern/Minimal)                                  │
│  • Color scheme                                                      │
│  • Font size                                                         │
│  • Image selection                                                   │
│                                                                      │
│  Duration: 20-30 seconds                                            │
│  Output: PDF + PNG                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                        [Poster ready ✓]
                                   ▼

═══════════════════════════════════════════════════════════════════════
REEL GENERATION FLOW
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  REEL GENERATION (/reel-generation) 🎥                              │
├─────────────────────────────────────────────────────────────────────┤
│  Process:                                                            │
│  1. AI extracts highlights (3-5 points)                             │
│  2. Creates punchy script (30-60s)                                  │
│  3. Selects 2-3 key images                                          │
│  4. Generates quick transitions                                     │
│  5. Adds text overlays                                              │
│  6. Exports vertical video                                          │
│                                                                      │
│  Format Options:                                                     │
│  • Vertical (9:16) - Instagram/TikTok                               │
│  • Square (1:1) - Social media                                      │
│                                                                      │
│  Features:                                                           │
│  • Auto-captions                                                     │
│  • Dynamic text                                                      │
│  • Attention-grabbing intro                                         │
│  • Call-to-action outro                                             │
│                                                                      │
│  Duration: 30-45 seconds generation                                 │
│  Output: 30-60s vertical MP4                                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                         [Reel ready ✓]
                                   ▼

═══════════════════════════════════════════════════════════════════════
PODCAST GENERATION FLOW
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  PODCAST GENERATION (/podcast-generation) 🎙️                        │
├─────────────────────────────────────────────────────────────────────┤
│  Process:                                                            │
│  1. AI generates conversational dialogue                            │
│     Speaker 1 (Host): "So, what's this about?"                      │
│     Speaker 2 (Expert): "Great question! This research..."          │
│  2. Assigns voices:                                                  │
│     • Speaker 1: Male (Arvind/Karun)                                │
│     • Speaker 2: Female (Meera/Vidya)                               │
│  3. Generates audio with TTS                                        │
│  4. Adds intro/outro music                                          │
│  5. Combines all segments                                           │
│                                                                      │
│  Structure:                                                          │
│  • Introduction (30s)                                               │
│  • Main discussion (4-13 min)                                       │
│  • Key findings (1 min)                                             │
│  • Conclusion (30s)                                                 │
│                                                                      │
│  Duration: 2-3 minutes generation                                   │
│  Output: 5-15 min WAV/MP3 file                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                       [Podcast ready ✓]
                                   ▼

═══════════════════════════════════════════════════════════════════════
AUDIO SUMMARY FLOW (NEW)
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  AUDIO SUMMARY (/audio-generation) 🎧                               │
├─────────────────────────────────────────────────────────────────────┤
│  Process:                                                            │
│  1. AI generates 200-300 word summary                               │
│  2. Covers:                                                          │
│     • Main objective                                                │
│     • Methodology                                                    │
│     • Key findings                                                   │
│     • Significance                                                   │
│  3. Converts to audio with TTS                                      │
│  4. Single voice narration                                          │
│                                                                      │
│  Language Options:                                                   │
│  • English (India)                                                   │
│  • Hindi                                                             │
│  • Tamil, Telugu, Bengali, Malayalam, Kannada                       │
│                                                                      │
│  Voice Selection:                                                    │
│  • English: Male voice (Arvind)                                     │
│  • Indian languages: Female voice (Meera)                           │
│                                                                      │
│  Custom Audio Player:                                                │
│  • Play/Pause button                                                │
│  • Seek bar                                                          │
│  • Time display (current/total)                                     │
│  • Download button                                                   │
│  • Regenerate option                                                │
│                                                                      │
│  Duration: 20-30 seconds generation                                 │
│  Output: 2-3 min WAV file                                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    [Audio summary ready ✓]
                                   ▼

═══════════════════════════════════════════════════════════════════════
ALL FLOWS CONVERGE HERE
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: RESULTS (/results) 🎉                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Available Downloads:                                                │
│                                                                      │
│  📹 Video file (MP4)                                                │
│  🎵 Audio files (WAV)                                               │
│  📊 Slides (PDF)                                                    │
│  📄 LaTeX source                                                    │
│  🖼️  Extracted images                                               │
│  🎙️  Podcast (if generated)                                         │
│  🎧 Audio summary (if generated)                                    │
│  📰 Poster (if generated)                                           │
│  🎥 Reel (if generated)                                             │
│                                                                      │
│  Actions:                                                            │
│  • Preview files                                                     │
│  • Download individual files                                        │
│  • Download all as ZIP                                              │
│  • Share links                                                       │
│  • Regenerate content                                               │
│  • Start new project                                                │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
AI CHATBOT (Available on Output Selection)
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  AI CHATBOT 🤖 (Floating Button)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Feature 1: Q&A CHAT                                                │
│  ─────────────────────                                              │
│  • Ask questions about paper                                        │
│  • Get AI-powered answers                                           │
│  • Context-aware responses                                          │
│  • Conversation history                                             │
│                                                                      │
│  Example Questions:                                                  │
│  ❓ "What is the main contribution?"                                 │
│  ❓ "Explain the methodology"                                        │
│  ❓ "What are the key findings?"                                     │
│                                                                      │
│  Feature 2: QUIZ GENERATION                                         │
│  ─────────────────────────                                          │
│  • Generate 5 MCQ questions                                         │
│  • Test paper understanding                                         │
│  • 4 options per question (A, B, C, D)                              │
│  • Progress: (X/5 answered)                                         │
│  • Submit after all answered                                        │
│  • Results with score                                               │
│  • Explanations provided                                            │
│                                                                      │
│  Feature 3: SUGGESTED QUESTIONS                                     │
│  ────────────────────────────────                                   │
│  • AI generates 5 relevant questions                                │
│  • Always visible (💡 icon)                                         │
│  • Refresh button                                                    │
│  • Click to ask                                                      │
│  • Auto-refresh after Q&A                                           │
│                                                                      │
│  Examples:                                                           │
│  💡 "What problem does this solve?"                                  │
│  💡 "How does this compare to existing methods?"                     │
│  💡 "What are the limitations?"                                      │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
TECHNICAL ARCHITECTURE
═══════════════════════════════════════════════════════════════════════

Frontend (React)                Backend (FastAPI)              AI Services
─────────────────              ──────────────────              ────────────
• Landing Page                 • API Routes                    • Google Gemini
• API Setup                      - /papers                       - Script gen
• Paper Processing               - /scripts                      - Chat Q&A
• Output Selection               - /slides                       - Quiz gen
• Script Generation              - /media                        - Summary gen
• Slide Creation                 - /images
• Media Generation               - /reels                      • Sarvam TTS
• Results                        - /podcasts                     - Audio gen
                                 - /posters                      - Multi-voice
• Chatbot UI                     - /chatbot                      - 7 languages
                                 - /audio
                                                                • FFmpeg
• State Management             • Services Layer                  - Video enc
  - WorkflowContext              - chatbot_service               - Transitions
  - AuthContext                  - script_generator
  - ApiContext                   - pdf_processor              • LaTeX/Poppler
  - ThemeContext                 - latex_processor              - PDF compile
                                 - beamer_generator              - Image extract
                                 - tts_service
                                 - video_service
                                 - podcast_generator
                                 - poster_generator
                                 - reel_generator

═══════════════════════════════════════════════════════════════════════
FILE STORAGE STRUCTURE
═══════════════════════════════════════════════════════════════════════

temp/
├── papers/
│   └── {paper_id}/
│       ├── source.pdf
│       ├── source.tex
│       └── metadata.json
│
├── images/
│   └── {paper_id}/
│       ├── figure1.png
│       ├── figure2.png
│       └── ...
│
├── scripts/
│   └── {paper_id}/
│       └── scripts.json
│
├── slides/
│   └── {paper_id}/
│       ├── slides.pdf
│       ├── slide_001.png
│       └── ...
│
├── audio/
│   └── {paper_id}/
│       ├── section_01.wav
│       ├── section_02.wav
│       ├── combined.wav
│       └── audio.wav (summary)
│
├── videos/
│   └── {paper_id}/
│       └── presentation.mp4
│
├── posters/
│   └── {paper_id}/
│       ├── poster.pdf
│       └── poster.png
│
├── reels/
│   └── {paper_id}/
│       └── reel.mp4
│
└── podcasts/
    └── {paper_id}/
        ├── podcast.wav
        └── metadata.json

═══════════════════════════════════════════════════════════════════════
API ENDPOINTS OVERVIEW
═══════════════════════════════════════════════════════════════════════

Authentication
──────────────
POST   /api/auth/google             Google OAuth
GET    /api/auth/verify              Verify token

Papers
──────
POST   /api/papers/upload-arxiv      Upload via arXiv
POST   /api/papers/upload-latex      Upload ZIP
GET    /api/papers/{id}              Get paper info
PUT    /api/papers/{id}/metadata     Update metadata

Scripts
───────
POST   /api/scripts/{id}/generate    Generate scripts
GET    /api/scripts/{id}             Get all scripts
PUT    /api/scripts/{id}/section/{}  Update section

Slides
──────
POST   /api/slides/{id}/generate     Generate slides
GET    /api/slides/{id}/preview      Preview PDF
GET    /api/slides/{id}/download     Download PDF

Media
─────
POST   /api/media/{id}/generate-audio    Generate audio
POST   /api/media/{id}/generate-video    Generate video
GET    /api/media/{id}/status            Check status

Chatbot
───────
POST   /api/chatbot/{id}/initialize       Init chatbot
POST   /api/chatbot/{id}/chat             Send message
POST   /api/chatbot/{id}/generate-quiz    Generate quiz
GET    /api/chatbot/{id}/suggested        Get suggestions

Podcasts
────────
POST   /api/podcasts/{id}/generate    Generate podcast
GET    /api/podcasts/{id}/stream      Stream audio
GET    /api/podcasts/{id}/download    Download file

Posters
───────
POST   /api/posters/{id}/generate     Generate poster
GET    /api/posters/{id}/preview      Preview image
GET    /api/posters/{id}/download     Download PDF

Reels
─────
POST   /api/reels/{id}/generate       Generate reel
GET    /api/reels/{id}/preview        Preview video
GET    /api/reels/{id}/download       Download MP4

Audio Summary
─────────────
POST   /api/audio/{id}/generate       Generate audio
GET    /api/audio/{id}/stream         Stream audio
GET    /api/audio/{id}/download       Download file
GET    /api/audio/{id}/status         Check status

═══════════════════════════════════════════════════════════════════════
