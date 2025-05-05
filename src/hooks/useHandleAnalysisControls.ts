import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { IAnalysisVideoPlayerRef } from "../components/analysisVideoPlayer.tsx";
import { v4 } from "uuid";
import {
  getOverlappedEvents,
  insertEventInOrder,
  mergeEvents,
} from "../utils/events.ts";

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

const createNewEvent = (
  eventType: AnalysisEventType,
  currentTime: number,
): AnalysisEventSummary => {
  return {
    eventId: v4(),
    eventTypeId: eventType.id,
    category: eventType.category,
    startTimestamp: currentTime,
  };
};

export const useHandleAnalysisControls = ({
  events,
}: IUseHandleAnalysisControlsParams) => {
  const [capturedEvents, setCapturedEvents] = useState<
    Record<number, AnalysisEventSummary[]>
  >({});
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const videoRef = useRef<IAnalysisVideoPlayerRef>(null);

  const upsertEvent = useCallback((updatedEvent: AnalysisEventSummary) => {
    setCapturedEvents((prev) => {
      const events = prev[updatedEvent.eventTypeId] || [];

      const newEvents = insertEventInOrder(
        events.filter((e) => e.eventId !== updatedEvent.eventId),
        updatedEvent,
      );

      return {
        ...prev,
        [updatedEvent.eventTypeId]: newEvents,
      };
    });
  }, []);

  const removeEvent = useCallback((eventId: string, eventTypeId: number) => {
    setCapturedEvents((prev) => {
      const events = prev[eventTypeId] || [];

      const newEvents = events.filter((e) => e.eventId !== eventId);

      return {
        ...prev,
        [eventTypeId]: newEvents,
      };
    });
  }, []);

  const onAddEvent = useCallback(
    (eventType: AnalysisEventType) => {
      if (!videoRef.current || videoRef.current.isPaused) {
        return;
      }

      const currentTime = videoRef.current.currentTime;

      const { id: eventTypeId, category } = eventType;

      if (category === "single") {
        upsertEvent(createNewEvent(eventType, currentTime));
        return;
      }

      const lastOpenEvent = getLastOpenEvent(
        eventTypeId,
        capturedEvents[eventType.id] ?? [],
        currentTime,
      );

      if (!lastOpenEvent) {
        upsertEvent(createNewEvent(eventType, currentTime));
        return;
      }

      const updatedEvent: AnalysisEventSummary = {
        ...lastOpenEvent,
        endTimestamp: currentTime,
      };

      const overlappingEvents = getOverlappedEvents(
        updatedEvent,
        capturedEvents[eventType.id].filter(
          (e) => e.eventId !== lastOpenEvent.eventId,
        ) ?? [],
      );

      if (overlappingEvents.length === 0) {
        upsertEvent(updatedEvent);
        return;
      }

      const overlappedEvents = [...overlappingEvents, updatedEvent];
      const mergedEvents = mergeEvents([...overlappingEvents, updatedEvent]);

      const eventsToRemove = overlappedEvents.filter(
        (e) => !mergedEvents.some((me) => me.eventId === e.eventId),
      );

      eventsToRemove.forEach((event) =>
        removeEvent(event.eventId, eventTypeId),
      );

      mergedEvents.forEach((mergedEvent) => upsertEvent(mergedEvent));
    },
    [capturedEvents, removeEvent, upsertEvent],
  );

  useEffect(() => {
    const keyHandler = getKeydownHandler(videoRef, events, onAddEvent);
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [events, onAddEvent]);

  const inProgressEventDurations = Object.values(capturedEvents).reduce(
    (acc, events) => {
      const rangeEvents = events.filter(
        (e) => e.category === "range" && !e.endTimestamp,
      );
      const durations = rangeEvents.map((e) => {
        return currentPlaybackTime - e.startTimestamp;
      });
      return [...acc, ...durations];
    },
    [] as number[],
  );

  return {
    videoRef,
    capturedEvents,
    inProgressEventDurations,
    setCurrentPlaybackTime,
    currentPlaybackTime,
    removeEvent,
  };
};
