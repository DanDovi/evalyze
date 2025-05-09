import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import React from "react";

import styles from "./eventTimeline.module.scss";
import { IAnalysisVideoPlayerRef } from "./analysisVideoPlayer.tsx";

interface IEventTimelineProps {
  eventTypes: AnalysisEventType[];
  events: Record<number, AnalysisEventSummary[]>;
  videoDuration: number;
  currentTime: number;
  videoRef?: React.RefObject<IAnalysisVideoPlayerRef>;
}

const getEventWidth = (
  event: AnalysisEventSummary,
  currentTime: number,
  videoDuration: number,
) => {
  if (event.category === "single") {
    return "2px";
  }
  return `${(((event.endTimestamp || currentTime) - event.startTimestamp) / videoDuration) * 100}%`;
};

export const EventTimeline = ({
  eventTypes,
  events,
  videoDuration,
  currentTime,
  videoRef,
}: IEventTimelineProps) => {
  // TODO: Make this work better for longer and shorter videos
  const timeTicks = React.useMemo(() => {
    return Array.from({ length: Math.floor(videoDuration) }, (_, i) => i);
  }, [videoDuration]);

  const onRulerClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef?.current) return;

      const ruler = e.currentTarget;
      const clickX = e.clientX - ruler.getBoundingClientRect().left;

      videoRef.current.seek((clickX / ruler.clientWidth) * videoDuration);
    },
    [videoRef, videoDuration],
  );

  const onRulerDrag = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const mouseIsDown = e.buttons === 1;
      const ruler = e.currentTarget;
      if (mouseIsDown && videoRef?.current && ruler) {
        const ruler = e.currentTarget;
        const clickX = e.clientX - ruler.getBoundingClientRect().left;
        videoRef.current.seek((clickX / ruler.clientWidth) * videoDuration);
      }
    },
    [videoDuration, videoRef],
  );

  return (
    <div className={styles.eventTimeline}>
      <div className={styles.timeMarkerContainer}>
        <div
          className={styles.currentTimeMarker}
          style={{
            left: `${(currentTime / videoDuration) * 100}%`,
          }}
        />
      </div>

      <div
        className={styles.ruler}
        onClick={onRulerClick}
        onMouseMove={(e) => onRulerDrag(e)}
      >
        {/* Add time markers - every 5 seconds */}
        {timeTicks.map((i) => {
          return (
            <div
              key={i}
              data-large={i % 5 === 0}
              className={styles.tickMarker}
              style={{
                left: `${(i / videoDuration) * 100}%`,
              }}
            />
          );
        })}
      </div>

      {eventTypes.map((eventType, i) => {
        return (
          <React.Fragment key={eventType.name}>
            <div
              key={eventType.name}
              className={styles.eventTypeLabel}
              style={{ gridRow: i + 2 }}
            >
              <span className={styles.eventName}>{eventType.name}</span>
              <span className={styles.eventKey}>
                Press{" "}
                <div className={styles.keyIcon}>
                  <div className={styles.keyInner}>
                    {`${eventType.keyboardKey.toUpperCase()}`}
                  </div>
                </div>
              </span>
            </div>
            <div className={styles.eventTimelineRow} style={{ gridRow: i + 2 }}>
              {events[eventType.id]?.map((event) => {
                return (
                  <div
                    key={event.startTimestamp}
                    className={styles.eventMarker}
                    style={{
                      left: `${(event.startTimestamp / videoDuration) * 100}%`,
                      width: getEventWidth(event, currentTime, videoDuration),
                    }}
                  />
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
