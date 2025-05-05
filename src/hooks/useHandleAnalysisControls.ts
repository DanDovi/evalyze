import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { sortedInsert } from "../utils/arrays.ts";
import { IAnalysisVideoPlayerRef } from "../components/analysisVideoPlayer.tsx";

interface IUseHandleAnalysisControlsParams {
  events: AnalysisEventType[];
}

const toggleVideoPlay = (videoRef: RefObject<IAnalysisVideoPlayerRef>) => {
  if (videoRef.current) {
    if (videoRef.current.isPaused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }
};

const getKeydownHandler = (
  videoRef: RefObject<IAnalysisVideoPlayerRef>,
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
      e.preventDefault();
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

  const inProgressEvent = events.findIndex((e) => {
    const isSameEventType = e.eventTypeId === newEvent.eventTypeId;

    if (!isSameEventType) return false;

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

    array[inProgressEvent] = {
      ...array[inProgressEvent],
      endTimestamp: newEvent.startTimestamp,
    };
    return array;
  }

  return sortedInsert(events, newEvent, "startTimestamp");
};

const insertEventInOrder = (
  events: AnalysisEventSummary[],
  newEvent: AnalysisEventSummary,
) => {
  if (newEvent.category === "range") {
    return insertRangeEventInOrder(events, newEvent);
  } else {
    return insertSingleEventInOrder(events, newEvent);
  }
};

const getLastOpenEvent = (
  eventTypeId: number,
  events: AnalysisEventSummary[],
  currentTime: number,
): AnalysisEventSummary | null => {
  const lastOpenEvent = events.find((e) => {
    const isSameEventType = e.eventTypeId === eventTypeId;

    if (!isSameEventType) return false;

    return e.startTimestamp < currentTime && e.endTimestamp === undefined;
  });

  return lastOpenEvent || null;
};

export const useHandleAnalysisControls = ({
  events,
}: IUseHandleAnalysisControlsParams) => {
  const [capturedEvents, setCapturedEvents] = useState<
    Array<AnalysisEventSummary>
  >([]);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const videoRef = useRef<IAnalysisVideoPlayerRef>(null);

  const addNewEvent = useCallback(
    (
      eventTypeId: number,
      category: AnalysisEventSummary["category"],
      startTimestamp: number,
    ) => {
      const newEvent: AnalysisEventSummary = {
        eventTypeId,
        category,
        startTimestamp,
      };

      setCapturedEvents((prev) => {
        return insertEventInOrder(prev, newEvent);
      });
    },
    [setCapturedEvents],
  );

  const onAddEvent = useCallback(
    (eventType: AnalysisEventType) => {
      if (!videoRef.current || videoRef.current.isPaused) {
        return;
      }

      const currentTime = videoRef.current.currentTime;

      const { id, category } = eventType;

      if (category === "single") {
        addNewEvent(id, category, currentTime);
        return;
      }

      const lastOpenEvent = getLastOpenEvent(id, capturedEvents, currentTime);

      const newEvent: AnalysisEventSummary = {
        eventId: lastOpenEvent ? lastOpenEvent.eventId : "",
        eventTypeId: id,
        category,
        startTimestamp: lastOpenEvent
          ? lastOpenEvent.startTimestamp
          : currentTime,
        endTimestamp: lastOpenEvent ? currentTime : undefined,
      };
    },
    [addNewEvent, capturedEvents],
  );

  useEffect(() => {
    const keyHandler = getKeydownHandler(videoRef, events, onAddEvent);
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [events, onAddEvent]);

  const currentRangeEvents = capturedEvents.filter((e) => {
    if (e.category === "single" || !videoRef.current) return false;
    const currentTime = videoRef.current.currentTime;

    const startHasPassed = e.startTimestamp < currentTime;
    const endHasPassed = e.endTimestamp && e.endTimestamp < currentTime;

    return startHasPassed && !endHasPassed;
  });

  const currentRangeEventDurations = currentRangeEvents.map((e) => ({
    eventTypeId: e.eventTypeId,
    timeSinceStart: currentPlaybackTime - e.startTimestamp,
  }));

  return {
    videoRef,
    capturedEvents,
    currentRangeEventDurations,
    setCurrentPlaybackTime,
    currentPlaybackTime,
  };
};
