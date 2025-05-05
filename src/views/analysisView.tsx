import { useEffect, useState } from "react";
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
import { AnalysisVideoPlayer } from "../components/analysisVideoPlayer.tsx";
import { groupedEventsToArray } from "../utils/events.ts";

import styles from "./analysisView.module.scss";

export const AnalysisView = () => {
  const { id } = useParams();
  const { throwError } = useAsyncError();

  const [rawEventsOpen, setRawEventsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisWithEventTypes | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(parseInt(id, 10))
      .then(setAnalysis)
      .catch((e) => {
        throwError(e);
      });
  }, [id, throwError]);

  const {
    capturedEvents,
    videoRef,
    currentPlaybackTime,
    setCurrentPlaybackTime,
    removeEvent
  } = useHandleAnalysisControls({
    events: analysis?.eventTypes ?? [],
  });

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
          <AnalysisVideoPlayer
            className={styles.video}
            src={convertFileSrc(analysis.analysisData.path)}
            ref={videoRef}
            onPlaybackTimeUpdate={setCurrentPlaybackTime}
            playbackRate={playbackRate}
            onPlaybackRateChange={setPlaybackRate}
            onVideoStart={() => setIsPlaying(true)}
            onVideoStop={() => setIsPlaying(false)}
          />
          <div className={styles.videoControls}>
            <RadioGroupButtons
              value={playbackRate}
              options={[1, 2, 4].map((v) => ({ label: `${v}x`, value: v }))}
              onChange={(v) => setPlaybackRate(Number(v))}
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
        events={groupedEventsToArray(capturedEvents)}
        isPlaying={isPlaying}
        isOpen={rawEventsOpen}
        onDeleteEvent={removeEvent}
      />
    </div>
  );
};
