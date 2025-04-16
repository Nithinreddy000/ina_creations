import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const YT_QUALITIES = [
  { value: 'highres', label: 'Best' },
  { value: 'hd1080', label: '1080p' },
  { value: 'hd720', label: '720p' },
  { value: 'large', label: '480p' },
  { value: 'medium', label: '360p' },
  { value: 'small', label: '240p' },
];

const YouTubeVideo = ({
  videoId,
  className,
  autoPlay = false,
  muted = true,
  controls = true,
  playsInline = true,
  showFullscreenButton = false,
  key: videoKey,
}) => {
  const iframeRef = useRef(null);
  // Only keep minimal state for mute if needed
  const [isMuted, setIsMuted] = React.useState(true);

  // Helper to set highest quality via postMessage
  const setHighestQuality = () => {
    if (!iframeRef.current) return;
    // Try 'highres', fallback to 'hd1080', 'hd720', etc.
    const qualities = ['highres', 'hd1080', 'hd720', 'large', 'medium', 'small'];
    for (const q of qualities) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: [q] }),
        '*'
      );
    }
  };

  // Helper to mute/unmute via postMessage
  const setMuteState = (mute) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: mute ? 'mute' : 'unMute', args: [] }),
      '*'
    );
    setIsMuted(mute);
  };



  // Force mute=1 if autoplay is set (browser policy)
  const forceMute = autoPlay ? 1 : (muted ? 1 : 0);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${forceMute}&controls=1&playsinline=${playsInline ? 1 : 0}&rel=0&modestbranding=1&showinfo=0&fs=1&enablejsapi=1`;

  // Sync mute state with prop and autoplay
  useEffect(() => {
    setIsMuted(forceMute === 1);
  }, [forceMute]);


  return (
    <div className={`relative ${className}`}>
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeVideo;
