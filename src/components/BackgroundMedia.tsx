import React from 'react';

export const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('data:video/')) return true;
  if (lower.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/)) return true;
  return false;
};

interface BackgroundMediaProps {
  src?: string;
  posX?: number;
  posY?: number;
  zoom?: number;
  className?: string;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  src,
  posX = 0,
  posY = 0,
  zoom = 100,
  className = '',
}) => {
  const bgUrl = src || '/background.jpg';
  const isVideo = isVideoUrl(bgUrl);

  const style: React.CSSProperties = {
    transform: `translate(${posX}%, ${posY}%) scale(${zoom / 100})`,
    transformOrigin: 'center center',
  };

  if (isVideo) {
    return (
      <video
        src={bgUrl}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-75 ${className}`}
        style={style}
      />
    );
  }

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
