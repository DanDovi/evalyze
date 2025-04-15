import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface IAnalysisVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
}

export interface IAnalysosVideoPlayerProps {
  className?: string;
  playbackRate?: number;
  onPlaybackRateChange?: (playbackRate: number) => void;
  src: string;
  onPlaybackTimeUpdate?: (currentTime: number) => void;
  onVideoStart?: () => void;
  onVideoStop?: () => void;
}

export const AnalysisVideoPlayer = forwardRef<
  IAnalysisVideoPlayerRef,
  IAnalysosVideoPlayerProps
>(
  (
    {
      onPlaybackTimeUpdate,
      onVideoStart,
      onVideoStop,
      playbackRate,
      onPlaybackRateChange,
      ...props
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const onAnimationFrame = useCallback(() => {
      if (videoRef.current) {
        onPlaybackTimeUpdate?.(videoRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
      }
    }, [onPlaybackTimeUpdate]);

    const onStart = useCallback(() => {
      if (videoRef.current) {
        onPlaybackTimeUpdate?.(videoRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
        onVideoStart?.();
      }
    }, [onAnimationFrame, onPlaybackTimeUpdate, onVideoStart]);

    const onStop = useCallback(() => {
      if (videoRef.current) {
        console.log("stopping video");
        onPlaybackTimeUpdate?.(videoRef.current.currentTime);
        onVideoStop?.();
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
    }, [onPlaybackTimeUpdate, onVideoStop]);

    const onSeeked = useCallback(() => {
      if (videoRef.current) {
        onPlaybackTimeUpdate?.(videoRef.current.currentTime);
      }
    }, [onPlaybackTimeUpdate]);

    const onRateChange = useCallback(() => {
      if (
        !videoRef.current ||
        playbackRate === videoRef?.current.playbackRate
      ) {
        return;
      }

      const allowedRates = [1, 2, 4];

      const currentRate = videoRef.current.playbackRate;

      if (!allowedRates.includes(currentRate)) {
        videoRef.current.playbackRate = 1;
      }

      onPlaybackRateChange?.(videoRef.current.playbackRate);
    }, [onPlaybackRateChange, playbackRate]);

    const setVideoRef = useCallback(
      (node: HTMLVideoElement) => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("play", onStart);
          videoRef.current.removeEventListener("pause", onStop);
          videoRef.current.removeEventListener("ended", onStop);
          videoRef.current.removeEventListener("seeked", onSeeked);
          videoRef.current.removeEventListener("ratechange", onRateChange);
        }
        if (node) {
          node.addEventListener("play", onStart);
          node.addEventListener("pause", onStop);
          node.addEventListener("ended", onStop);
          node.addEventListener("seeked", onSeeked);
          node.addEventListener("ratechange", onRateChange);
        }
        videoRef.current = node;
      },
      [onStart, onStop, onSeeked, onRateChange],
    );

    useEffect(() => {
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        void videoRef.current?.play();
      },
      pause: () => {
        void videoRef.current?.pause();
      },
      seek: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      },
      currentTime: videoRef.current?.currentTime ?? 0,
      isPlaying: !!videoRef.current && videoRef.current?.paused,
      isPaused: !videoRef.current || videoRef.current?.paused === true,
    }));

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackRate || 1;
      }
    }, [playbackRate]);

    return (
      <video
        ref={setVideoRef}
        className={props.className}
        src={props.src}
        playsInline
        controls
        controlsList={"nodownload noremoteplayback"}
        disablePictureInPicture
      />
    );
  },
);

AnalysisVideoPlayer.displayName = "AnalysisVideoPlayer";
