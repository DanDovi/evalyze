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

export const useHandleAnalysisControls = ({
  events,
}: IUseHandleAnalysisControlsParams) => {
  const [capturedEvents, setCapturedEvents] = useState<
    Array<AnalysisEventSummary>
  >([]);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onVideoStart = useCallback(() => {
    if (videoRef.current) {
      setCurrentPlaybackTime(videoRef.current.currentTime);
      intervalRef.current = setInterval(() => {
        if (videoRef.current) {
          console.log("updating current time");
          setCurrentPlaybackTime(videoRef.current.currentTime);
        }
      }, 50);
    }
  }, []);

  const onVideoStop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onScrubVideo = useCallback(() => {
    if (videoRef.current) {
      console.log("scrubbing video");
      setCurrentPlaybackTime(videoRef.current.currentTime);
    }
  }, []);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement) => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("play", onVideoStart);
        videoRef.current.removeEventListener("pause", onVideoStop);
        videoRef.current.removeEventListener("ended", onVideoStop);
        videoRef.current.removeEventListener("seeked", onScrubVideo);
      }
      if (node) {
        console.log("setting video ref");
        node.addEventListener("play", onVideoStart);
        node.addEventListener("pause", onVideoStop);
        node.addEventListener("ended", onVideoStop);
        node.addEventListener("seeked", onScrubVideo);
      }
      videoRef.current = node;
    },
    [onVideoStart, onVideoStop, onScrubVideo],
  );

  const onAddEvent = useCallback((eventType: AnalysisEventType) => {
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
  }, []);

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
    setVideoRef,
    videoRef,
    capturedEvents,
    currentRangeEventDurations,
    currentPlaybackTime,
  };
};
