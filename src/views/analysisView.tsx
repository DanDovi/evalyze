import { useCallback, useEffect, useState } from "react";
import {
  AnalysisWithEventTypes,
  getAnalysisById,
} from "../state/fileController.ts";
import { formatSeconds } from "../utils/time.ts";
import { formatDate } from "../utils/dates.ts";
import { useParams } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useHandleAnalysisControls } from "../hooks/useHandleAnalysisControls.ts";
import { useAsyncError } from "../hooks/useAsyncError.ts";
import { EventTimeline } from "../components/eventTimeline.tsx";
import { RawEventPanel } from "../components/rawEventPanel.tsx";
import { RadioGroupButtons } from "../components/radioGroupButtons.tsx";

import styles from "./analysisView.module.scss";

export const AnalysisView = () => {
  const { id } = useParams();
  const { throwError } = useAsyncError();

  const [rawEventsOpen, setRawEventsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisWithEventTypes | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(parseInt(id, 10))
      .then(setAnalysis)
      .catch((e) => {
        throwError(e);
      });
  }, [id, throwError]);

  const { capturedEvents, setVideoRef, videoRef, currentPlaybackTime } =
    useHandleAnalysisControls({
      events: analysis?.eventTypes ?? [],
    });

  const setPlaybackRateCallback = useCallback(
    (rate: number) => {
      if (!videoRef.current) return;
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    },
    [videoRef],
  );

  // Handle playback rate changes from the video element
  useEffect(() => {
    if (!videoRef.current) return;

    const onPlaybackRateChange = (rate: number) => {
      const rates = [1, 2, 4];
      if (!rates.includes(rate)) {
        setPlaybackRateCallback(1);
      }
    };

    const currentVideoRef = videoRef.current;

    currentVideoRef.addEventListener("ratechange", () =>
      onPlaybackRateChange(currentVideoRef.playbackRate),
    );

    return () => {
      currentVideoRef.removeEventListener("ratechange", () =>
        onPlaybackRateChange(currentVideoRef.playbackRate),
      );
    };
  }, [playbackRate, setPlaybackRateCallback, videoRef]);

  if (!analysis) return <div>Loading...</div>;

  return (
    <div className={styles.analysisView}>
      <div className={styles.analysisSection}>
        <div className={styles.section}>
          <h1>{analysis.analysisData.name}</h1>
          <div>
            <div>{`Duration: ${formatSeconds(analysis.analysisData.duration)}`}</div>
            <div>{`Last opened: ${formatDate(analysis.analysisData.lastOpenedAt)}`}</div>
          </div>
        </div>
        <div className={styles.videoContainer}>
          <button
            className={styles.rawEventsButton}
            onClick={() => setRawEventsOpen((prev) => !prev)}
          >
            Raw Events
          </button>
          <video
            ref={setVideoRef}
            className={styles.video}
            src={convertFileSrc(analysis.analysisData.path)}
            playsInline
            controls
            controlsList={"nodownload noremoteplayback"}
            disablePictureInPicture
          />
          <div className={styles.videoControls}>
            <RadioGroupButtons
              value={playbackRate}
              options={[1, 2, 4].map((v) => ({ label: `${v}x`, value: v }))}
              onChange={(v) => setPlaybackRateCallback(Number(v))}
            />
          </div>
        </div>
        <div className={styles.section}>
          <EventTimeline
            eventTypes={analysis.eventTypes}
            events={capturedEvents}
            videoDuration={analysis.analysisData.duration}
            currentTime={currentPlaybackTime}
            videoRef={videoRef}
          />
        </div>
      </div>
      <RawEventPanel
        analysisId={analysis.analysisData.id}
        eventTypes={analysis.eventTypes}
        events={capturedEvents}
        isOpen={rawEventsOpen}
      />
    </div>
  );
};
