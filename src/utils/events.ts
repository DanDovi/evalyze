import { type AnalysisEventSummary } from "../state/fileController.ts";
import { v4 } from "uuid";

export const groupEvents = (
  events: AnalysisEventSummary[],
): Record<number, AnalysisEventSummary[]> => {
  const mappedEvents = events.reduce(
    (acc, event) => {
      if (!acc[event.eventTypeId]) {
        acc[event.eventTypeId] = [];
      }
      acc[event.eventTypeId].push(event);
      return acc;
    },
    {} as Record<number, AnalysisEventSummary[]>,
  );

  Object.keys(mappedEvents).forEach((key) => {
    mappedEvents[Number(key)].sort(
      (a, b) => a.startTimestamp - b.startTimestamp,
    );
  });

  return mappedEvents;
};

export const groupedEventsToArray = (
  events: Record<number, AnalysisEventSummary[]>,
): AnalysisEventSummary[] => {
  return Object.values(events)
    .flat()
    .sort((a, b) => {
      return (
        a.startTimestamp - b.startTimestamp ||
        (a.endTimestamp || 0) - (b.endTimestamp || 0) ||
        a.eventTypeId - b.eventTypeId
      );
    });
};

export const getOverlappedEvents = (
  newEvent: AnalysisEventSummary,
  events: AnalysisEventSummary[],
): AnalysisEventSummary[] => {
  if (newEvent.category === "single") {
    return events.filter(
      (event) => event.startTimestamp === newEvent.startTimestamp,
    );
  }

  return events.filter((event) => {
    const newEventContainsEvent =
      newEvent.startTimestamp <= event.startTimestamp &&
      (newEvent.endTimestamp || 0) >= event.startTimestamp;

    const eventContainsNewEventStart =
      event.startTimestamp <= newEvent.startTimestamp &&
      (event.endTimestamp || 0) >= newEvent.startTimestamp;

    const eventContainsNewEventEnd =
      event.startTimestamp <= (newEvent.endTimestamp || 0) &&
      (event.endTimestamp || 0) >= (newEvent.endTimestamp || 0);

    return (
      newEventContainsEvent ||
      eventContainsNewEventStart ||
      eventContainsNewEventEnd
    );
  });
};

export const insertEventInOrder = (
  events: AnalysisEventSummary[],
  newEvent: AnalysisEventSummary,
): AnalysisEventSummary[] => {
  const newEvents = [...events, newEvent];
  return newEvents.sort(
    (a, b) =>
      a.startTimestamp - b.startTimestamp ||
      (a.endTimestamp ?? 0) - (b.endTimestamp ?? 0),
  );
};

export const removeEvent = (
  eventId: string,
  events: AnalysisEventSummary[],
) => {
  return events.filter((event) => event.eventId !== eventId);
};

export const mergeEvents = (events: AnalysisEventSummary[]) => {
  const groupedEvents = groupEvents(events);

  Object.entries(groupedEvents).forEach(([id, events]) => {
    if (events.length <= 1) {
      return;
    }

    if (events[0].category === "single") {
      groupedEvents[Number(id)] = events.filter(
        (e, i, arr) =>
          arr.findIndex((e2) => e2.startTimestamp === e.startTimestamp) === i,
      );
      return;
    }

    const mergedEvent = events.reduce(
      (acc, event) => {
        if (event.startTimestamp < acc.startTimestamp) {
          acc.startTimestamp = event.startTimestamp;
        }
        if (
          event.endTimestamp &&
          (!acc.endTimestamp || event.endTimestamp > acc.endTimestamp)
        ) {
          acc.endTimestamp = event.endTimestamp;
        }
        return acc;
      },
      {
        ...events[0],
      } as AnalysisEventSummary,
    );

    groupedEvents[Number(id)] = [mergedEvent];
  });

  return groupedEventsToArray(groupedEvents);
};

export const splitEvents = (events: AnalysisEventSummary[]) => {
  const groupedEvents = groupEvents(events);

  Object.entries(groupedEvents).forEach(([id, events]) => {
    if (events.length <= 1) {
      return;
    }

    if (events[0].category === "single") {
      groupedEvents[Number(id)] = events.filter(
        (e, i, arr) =>
          arr.findIndex((e2) => e2.startTimestamp === e.startTimestamp) === i,
      );
      return;
    }

    const sortedTimestamps = events
      .flatMap((event) => [event.startTimestamp, event.endTimestamp || 0])
      .sort((a, b) => a - b);

    const splitEvents: AnalysisEventSummary[] = [];

    for (let i = 0; i < sortedTimestamps.length - 1; i++) {
      const startTimestamp = sortedTimestamps[i];
      const endTimestamp = sortedTimestamps[i + 1];

      if (startTimestamp === endTimestamp) {
        continue;
      }

      const newEvent: AnalysisEventSummary = {
        ...events[0],
        startTimestamp,
        endTimestamp,
      };

      splitEvents.push(newEvent);
    }

    const originalIds = events.map((event) => event.eventId);

    const newIds = Array.from(
      { length: splitEvents.length - originalIds.length },
      (_) => v4(),
    );

    [...originalIds, ...newIds].forEach((id, index) => {
      splitEvents[index].eventId = id;
    });

    groupedEvents[Number(id)] = splitEvents;
  });

  return groupedEventsToArray(groupedEvents);
};
