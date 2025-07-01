export const createSafeAudioUrl = (baseUrl, paperId, filename) => {
  const url = `${baseUrl}/api/media/${paperId}/stream-audio/${filename}`;
  return `${url}?t=${Date.now()}`; // Prevent caching
};

export const checkAudioSupport = () => {
  const audio = document.createElement('audio');
  return {
    mp3: audio.canPlayType('audio/mpeg') !== '',
    wav: audio.canPlayType('audio/wav') !== '',
    ogg: audio.canPlayType('audio/ogg') !== '',
    webm: audio.canPlayType('audio/webm') !== ''
  };
};

export const handleMediaError = (error, filename) => {
  console.error('Media error:', error);
  
  switch (error.name) {
    case 'NotSupportedError':
      return `Audio format not supported. Try downloading ${filename} directly.`;
    case 'NotAllowedError':
      return 'Playback blocked by browser. Click to enable audio.';
    case 'AbortError':
      return 'Playback was aborted.';
    default:
      return `Playback failed: ${error.message}`;
  }
};


export const createSafeVideoUrl = (baseUrl, paperId) => {
  const url = `${baseUrl}/api/media/${paperId}/stream-video`;
  return `${url}?t=${Date.now()}`; // Prevent caching
};

export const checkVideoSupport = () => {
  const video = document.createElement('video');
  return {
    mp4: video.canPlayType('video/mp4') !== '',
    webm: video.canPlayType('video/webm') !== '',
    ogg: video.canPlayType('video/ogg') !== ''
  };
};

export const handleVideoError = (error) => {
  console.error('Video error:', error);
  
  switch (error.target?.error?.code) {
    case 1: // MEDIA_ERR_ABORTED
      return 'Video playback was aborted.';
    case 2: // MEDIA_ERR_NETWORK
      return 'Network error occurred while loading video.';
    case 3: // MEDIA_ERR_DECODE
      return 'Video format not supported or corrupted.';
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return 'Video format not supported by browser.';
    default:
      return `Video playback failed: ${error.message || 'Unknown error'}`;
  }
};
