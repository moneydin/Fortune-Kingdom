import React, { useRef, useEffect } from 'react';

export const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('data:video/')) return true;
  if (lower.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/)) return true;
  return false;
};

export const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    const simpleMatch = url.trim();
    if (simpleMatch.length === 11 && !simpleMatch.includes('/') && !simpleMatch.includes('.')) {
      videoId = simpleMatch;
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&playsinline=1&modestbranding=1`;
  }
  return null;
};

interface BackgroundMediaProps {
  src?: string;
  posX?: number;
  posY?: number;
  zoom?: number;
  mediaType?: 'auto' | 'image' | 'video';
  className?: string;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  src,
  posX = 0,
  posY = 0,
  zoom = 100,
  mediaType = 'auto',
  className = '',
}) => {
  const bgUrl = src || '/background.jpg';
  
  const ytUrl = getYouTubeEmbedUrl(bgUrl);
  const isYoutube = ytUrl !== null;
  const isVideoFile = isVideoUrl(bgUrl) || bgUrl.includes('video') || bgUrl.startsWith('blob:');
  
  // Decide if we should render as video or image
  const isVideo = mediaType === 'video' 
    ? true 
    : (mediaType === 'image' 
        ? false 
        : (isVideoFile || isYoutube));

  const videoRef = useRef<HTMLVideoElement>(null);

  const style: React.CSSProperties = {
    transform: `translate(${posX}%, ${posY}%) scale(${zoom / 100})`,
    transformOrigin: 'center center',
  };

  // Attempt to play the video and handle potential autoplay blockages
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay blocked or playback failed, waiting for user interaction:', err);
      });
    }
  };

  useEffect(() => {
    if (isVideo && !isYoutube) {
      // Reload video source and try to play
      if (videoRef.current) {
        videoRef.current.load();
      }
      playVideo();

      // Listen for any user interaction on the document to resume playback if blocked
      const handleInteraction = () => {
        if (videoRef.current && videoRef.current.paused) {
          playVideo();
        }
        // Remove listeners once interacted
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [bgUrl, isVideo, isYoutube]);

  // Render YouTube Iframe Background if it is a YouTube video
  if (isVideo && isYoutube && ytUrl) {
    return (
      <iframe
        key={ytUrl}
        src={ytUrl}
        title="Background YouTube Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; loop"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-75 scale-110 ${className}`}
        style={{ ...style, border: 'none' }}
      />
    );
  }

  // Render standard HTML5 Video if it is a direct video file
  if (isVideo) {
    return (
      <video
        key={bgUrl}
        ref={videoRef}
        src={bgUrl}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-75 ${className}`}
        style={style}
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          e.currentTarget.play().catch(err => console.log('Loop playback retry failed:', err));
        }}
      />
    );
  }

  // Otherwise, render as a static Background Image
  return (
    <div
      className={`absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-transform duration-75 ${className}`}
      style={{
        ...style,
        backgroundImage: `url("${bgUrl}")`,
      }}
    />
  );
};
