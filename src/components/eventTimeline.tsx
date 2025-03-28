import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import React, { Fragment } from "react";

interface IEventTimelineProps {
  eventTypes: AnalysisEventType[];
  events: AnalysisEventSummary[];
  videoDuration: number;
  currentTime: number;
}

type GroupedEvents = {
  [key: string]: AnalysisEventSummary[];
};

export const EventTimeline = ({
  eventTypes,
  events,
  videoDuration,
  currentTime,
}: IEventTimelineProps) => {
  const reducedEvents = React.useMemo(
    () =>
      events.reduce<GroupedEvents>((acc, event) => {
        const eventType = eventTypes.find(
          (type) => type.id === event.eventTypeId,
        );
        if (!eventType) return acc;

        if (!acc[eventType.name]) {
          acc[eventType.name] = [];
        }

        acc[eventType.name].push(event);
        return acc;
      }, {} as GroupedEvents),
    [events, eventTypes],
  );

  const timeTicks = React.useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= videoDuration; i += 1) {
      ticks.push(i);
    }
    return ticks;
  }, [videoDuration]);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {eventTypes.map((eventType, index) => {
        return (
          <div
            key={index}
            style={{
              width: `100%`,
              height: "20px",
              margin: "2px 0",
            }}
          >
            {reducedEvents[eventType.name]?.map((event) => {
              return (
                <div
                  key={event.startTimestamp}
                  style={{
                    position: "absolute",
                    left: `${(event.startTimestamp / videoDuration) * 100}%`,
                    width:
                      event.category === "single"
                        ? "2px"
                        : `${(((event.endTimestamp || currentTime) - event.startTimestamp) / videoDuration) * 100}%`,
                    height: "20px",
                    backgroundColor:
                      eventType?.category === "single" ? "blue" : "green",
                  }}
                ></div>
              );
            })}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${(currentTime / videoDuration) * 100}%`,
          width: "2px",
          height: "100%",
          backgroundColor: "red",
        }}
      ></div>

      <Fragment>
        {/* Add time markers - every 5 seconds */}
        {timeTicks.map((i) => {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "0",
                left: `${(i / videoDuration) * 100}%`,
                width: "1px",
                height: i % 5 === 0 ? "20px" : "10px",
                backgroundColor: "gray",
              }}
            ></div>
          );
        })}
      </Fragment>
    </div>
  );
};
