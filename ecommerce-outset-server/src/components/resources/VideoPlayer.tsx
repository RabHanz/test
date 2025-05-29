import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  LinearProgress,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { analyticsService } from '../../services/analytics';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  resourceId: string;
  onProgressUpdate: (progress: number) => void;
  initialProgress?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  resourceId,
  onProgressUpdate,
  initialProgress = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const newProgress = (video.currentTime / video.duration) * 100;
      setProgress(newProgress);
      setCurrentTime(video.currentTime);
      onProgressUpdate(newProgress);

      // Track progress milestones
      if (newProgress >= 25 && newProgress < 26) {
        analyticsService.trackVideoProgress(resourceId, 25);
      } else if (newProgress >= 50 && newProgress < 51) {
        analyticsService.trackVideoProgress(resourceId, 50);
      } else if (newProgress >= 75 && newProgress < 76) {
        analyticsService.trackVideoProgress(resourceId, 75);
      } else if (newProgress >= 95) {
        analyticsService.trackVideoProgress(resourceId, 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [resourceId, initialProgress, onProgressUpdate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        analyticsService.trackVideoPause(resourceId, currentTime);
      } else {
        videoRef.current.play();
        analyticsService.trackVideoPlay(resourceId, currentTime);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handlePlaybackRateChange = () => {
    if (videoRef.current) {
      const rates = [1, 1.25, 1.5, 1.75, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const nextRate = rates[(currentIndex + 1) % rates.length];
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: 'black',
        '&:hover .video-controls': {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', display: 'block' }}
        onClick={togglePlay}
      />
      
      {/* Video Controls */}
      <Box
        className="video-controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 1,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 1, height: 4, borderRadius: 2 }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={togglePlay} size="small" sx={{ color: 'white' }}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          
          <IconButton onClick={toggleMute} size="small" sx={{ color: 'white' }}>
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          
          <Typography variant="caption" sx={{ color: 'white', flexGrow: 1 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
          
          <Tooltip title={`${playbackRate}x Speed`}>
            <IconButton
              onClick={handlePlaybackRateChange}
              size="small"
              sx={{ color: 'white' }}
            >
              <SpeedIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton
            onClick={handleFullscreen}
            size="small"
            sx={{ color: 'white' }}
          >
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}; 