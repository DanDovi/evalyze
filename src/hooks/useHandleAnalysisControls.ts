import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { sortedInsert } from "../utils/arrays.ts";

interface IUseHandleAnalysisControlsParams {
  events: AnalysisEventType[];
}

const toggleVideoPlay = (videoRef: RefObject<HTMLVideoElement>) => {
  if (videoRef.current) {
    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }
};

const getKeydownHandler = (
  videoRef: RefObject<HTMLVideoElement>,
  events: AnalysisEventType[],
  addEvent: (event: AnalysisEventType) => void,
) => {
  const validKeys = [" ", ...events.map((event) => event.keyboardKey)].reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (e: KeyboardEvent) => {
    if (!videoRef.current || !validKeys[e.key]) return;

    if (e.key === " ") {
      toggleVideoPlay(videoRef);
    }
    const event = events.find((event) => event.keyboardKey === e.key);
    if (event) {
      addEvent(event);
    }
  };
};

const insertSingleEventInOrder = (
  events: AnalysisEventSummary[],
  newEvent: AnalysisEventSummary,
) => {
  if (newEvent.category !== "single") {
    return events;
  }

  return sortedInsert(events, newEvent, "startTimestamp");
};

const insertRangeEventInOrder = (
  events: AnalysisEventSummary[],
  newEvent: AnalysisEventSummary,
) => {
  if (newEvent.category !== "range") {
    return events;
  }

  const existingEventsOfSameType = events.filter(
    (e) => e.eventTypeId !== newEvent.eventTypeId,
  );

  const inProgressEvent = existingEventsOfSameType.findIndex((e) => {
    const isOpenEvent =
      e.startTimestamp < newEvent.startTimestamp &&
      e.endTimestamp === undefined;
    const containsEvent =
      e.endTimestamp &&
      e.startTimestamp < newEvent.startTimestamp &&
      e.endTimestamp > newEvent.startTimestamp;

    return isOpenEvent || containsEvent;
  });

  if (inProgressEvent >= 0) {
    const array = [...events];

    array[inProgressEvent].endTimestamp = newEvent.startTimestamp;
    return array;
  }

  return sortedInsert(events, newEvent, "startTimestamp");
};

const insertEventInOrder = (
  events: AnalysisEventSummary[],
  newEvent: AnalysisEventSummary,
) => {
  if (newEvent.category === "range") {
    // TODO: Implement this function
    return insertRangeEventInOrder(events, newEvent);
  } else {
    return insertSingleEventInOrder(events, newEvent);
  }
};

export const useHandleAnalysisControls = ({
  events,
}: IUseHandleAnalysisControlsParams) => {
  const [capturedEvents, setCapturedEvents] = useState<
    Array<AnalysisEventSummary>
  >([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onAddEvent = useCallback(
    (eventType: AnalysisEventType) => {
      if (!videoRef.current || videoRef.current.paused) {
        return;
      }

      const currentTime = videoRef.current.currentTime;

      const { id, category } = eventType;
      const newEvent: AnalysisEventSummary = {
        eventTypeId: id,
        category,
        startTimestamp: currentTime,
      };

      setCapturedEvents((prev) => {
        return insertEventInOrder(prev, newEvent);
      });
    },
    [capturedEvents],
  );

  const onKeyDown = useCallback(
    getKeydownHandler(videoRef, events, onAddEvent),
    [events],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [events]);

  const currentRangeEvents = capturedEvents.filter((e) => {
    if (e.category === "single" || !videoRef.current) return false;
    const currentTime = videoRef.current.currentTime;

    const startHasPassed = e.startTimestamp < currentTime;
    const endHasPassed = e.endTimestamp && e.endTimestamp < currentTime;

    return startHasPassed && !endHasPassed;
  });

  const currentRangeEventDurations = currentRangeEvents.map((e) => ({
    eventTypeId: e.eventTypeId,
    timeSinceStart: videoRef.current!.currentTime - e.startTimestamp,
  }));

  return { videoRef, capturedEvents, currentRangeEventDurations };
};
