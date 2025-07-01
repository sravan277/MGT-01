export const API_ENDPOINTS = {
  KEYS: '/keys',
  PAPERS: '/papers',
  SCRIPTS: '/scripts',
  SLIDES: '/slides',
  MEDIA: '/media',
  IMAGES: '/images'
};

export const WORKFLOW_STEPS = {
  DASHBOARD: 0,
  API_SETUP: 1,
  PAPER_PROCESSING: 2,
  SCRIPT_GENERATION: 3,
  SLIDE_CREATION: 4,
  MEDIA_GENERATION: 5,
  RESULTS: 6
};

export const SUPPORTED_FILE_TYPES = {
  ZIP: 'application/zip',
  PDF: 'application/pdf',
  TEX: 'text/plain'
};

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_VISIBLE_PAGES: 7
};

export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const TTS_VOICES = {
  ENGLISH: {
    meera: 'Meera (Female)',
    arjun: 'Arjun (Male)'
  },
  HINDI: {
    amol: 'Amol (Male)',
    mira: 'Mira (Female)'
  }
};

export const SCRIPT_SECTIONS = [
  'Introduction',
  'Methodology', 
  'Results',
  'Discussion',
  'Conclusion'
];

export const VIDEO_CONFIG = {
  DEFAULT_DPI: 300,
  SUPPORTED_FORMATS: ['mp4', 'avi', 'mov'],
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  DEFAULT_FPS: 1
};
