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

import styles from "./analysisView.module.scss";

export const AnalysisView = () => {
  let { id } = useParams();

  const [analysis, setAnalysis] = useState<AnalysisWithEventTypes | null>(null);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(parseInt(id, 10)).then(setAnalysis);
  }, [id]);

  const { capturedEvents, videoRef, currentRangeEventDurations } = useHandleAnalysisControls({
    events: analysis?.eventTypes ?? [],
  });

  if (!analysis) return <div>Loading...</div>;

  return (
    <div>
      <h1>{analysis.analysisData.name}</h1>
      <div>
        <div>{`Duration: ${formatSeconds(analysis.analysisData.duration)}`}</div>
        <div>{`Last opened: ${formatDate(analysis.analysisData.lastOpenedAt)}`}</div>
      </div>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          src={convertFileSrc(analysis.analysisData.path)}
          disablePictureInPicture
          playsInline
          controls
        />
      </div>

      <h2>Event Types</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Key</th>
          </tr>
        </thead>
        <tbody>
          {analysis.eventTypes.map((event) => (
            <tr key={event.id}>
              <td>{event.name}</td>
              <td>{event.category}</td>
              <td>{event.keyboardKey}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Events</h2>
      <h3>Current range events</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {currentRangeEventDurations.map((event) => (
            <tr key={event.eventTypeId}>
              <td>
                {
                  analysis?.eventTypes.find((e) => e.id === event.eventTypeId)
                    ?.name
                }
              </td>
              <td>{formatSeconds(event.timeSinceStart)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>All events</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Category</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {capturedEvents.map((event) => (
            <tr key={event.startTimestamp}>
              <td>
                {
                  analysis?.eventTypes.find((e) => e.id === event.eventTypeId)
                    ?.name
                }
              </td>
              <td>{event.category}</td>
              <td>{event.startTimestamp}</td>
              <td>{event.endTimestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
