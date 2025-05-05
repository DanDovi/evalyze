import { describe, expect } from "@jest/globals";
import {
  getOverlappedEvents,
  groupedEventsToArray,
  groupEvents,
  insertEventInOrder,
  mergeEvents,
  removeEvent,
  splitEvents,
} from "./events.ts";
import {
  AnalysisEventSummary,
  EventCategory,
} from "../state/fileController.ts";

describe("event utils", () => {
  describe("groupEvents", () => {
    it("should group events by eventTypeId", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
      ];

      const grouped = groupEvents(events);

      const expectedGrouped1: AnalysisEventSummary[] = [
        { eventId: "1", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "2", eventTypeId: 1, startTimestamp: 5, category: "single" },
      ];

      const expectedGrouped2: AnalysisEventSummary[] = [
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single",
        },
      ];

      expect(grouped[1]).toEqual(expectedGrouped1);
      expect(grouped[2]).toEqual(expectedGrouped2);
      expect(grouped[3]).toBeUndefined();
    });

    it("should return an empty object for an empty array", () => {
      const events: AnalysisEventSummary[] = [];
      const grouped = groupEvents(events);
      expect(grouped).toEqual({});
    });

    it("should order events by startTimestamp", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
      ];

      const grouped = groupEvents(events);

      const expectedGrouped1: AnalysisEventSummary[] = [
        { eventId: "2", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "1", eventTypeId: 1, startTimestamp: 5, category: "single" },
      ];

      const expectedGrouped2: AnalysisEventSummary[] = [
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single",
        },
      ];

      expect(grouped[1]).toEqual(expectedGrouped1);
      expect(grouped[2]).toEqual(expectedGrouped2);
      expect(grouped[3]).toBeUndefined();
    });
  });

  describe("groupedEventsToArray", () => {
    it("should convert grouped events to a flat array", () => {
      const groupedEvents = {
        1: [
          {
            eventId: "1",
            eventTypeId: 1,
            startTimestamp: 0,
            category: "single" as EventCategory,
          },
          {
            eventId: "2",
            eventTypeId: 1,
            startTimestamp: 5,
            category: "single" as EventCategory,
          },
        ],
        2: [
          {
            eventId: "3",
            eventTypeId: 2,
            startTimestamp: 10,
            category: "single" as EventCategory,
          },
        ],
      };

      const flatArray = groupedEventsToArray(groupedEvents);

      expect(flatArray).toEqual([
        { eventId: "1", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "2", eventTypeId: 1, startTimestamp: 5, category: "single" },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single",
        },
      ]);
    });

    it("should return an empty array for an empty object", () => {
      const groupedEvents: Record<number, AnalysisEventSummary[]> = {};
      const flatArray = groupedEventsToArray(groupedEvents);
      expect(flatArray).toEqual([]);
    });

    it("should order events by startTimestamp", () => {
      const groupedEvents: Record<number, AnalysisEventSummary[]> = {
        1: [
          {
            eventId: "1",
            eventTypeId: 1,
            startTimestamp: 5,
            category: "single",
          },
          {
            eventId: "2",
            eventTypeId: 1,
            startTimestamp: 0,
            category: "single",
          },
        ],
        2: [
          {
            eventId: "3",
            eventTypeId: 2,
            startTimestamp: 10,
            category: "single",
          },
          {
            eventId: "4",
            eventTypeId: 2,
            startTimestamp: 2,
            category: "single",
          },
        ],
        3: [
          {
            eventId: "5",
            eventTypeId: 3,
            startTimestamp: 7,
            endTimestamp: 20,
            category: "range",
          },
        ],
        4: [
          {
            eventId: "6",
            eventTypeId: 3,
            startTimestamp: 3,
            endTimestamp: 15,
            category: "range",
          },
        ],
      };

      const flatArray = groupedEventsToArray(groupedEvents);

      expect(flatArray).toEqual([
        { eventId: "2", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "4", eventTypeId: 2, startTimestamp: 2, category: "single" },
        {
          eventId: "6",
          eventTypeId: 3,
          startTimestamp: 3,
          endTimestamp: 15,
          category: "range",
        },
        { eventId: "1", eventTypeId: 1, startTimestamp: 5, category: "single" },
        {
          eventId: "5",
          eventTypeId: 3,
          startTimestamp: 7,
          endTimestamp: 20,
          category: "range",
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single",
        },
      ]);
    });

    it("should order events by endTimestamp if startTimestamp is the same", () => {
      const groupedEvents: Record<number, AnalysisEventSummary[]> = {
        1: [
          {
            eventId: "1",
            eventTypeId: 1,
            startTimestamp: 5,
            endTimestamp: 10,
            category: "range",
          },
          {
            eventId: "2",
            eventTypeId: 1,
            startTimestamp: 5,
            endTimestamp: 8,
            category: "range",
          },
        ],
        2: [
          {
            eventId: "3",
            eventTypeId: 2,
            startTimestamp: 5,
            category: "single",
          },
        ],
      };

      const flatArray = groupedEventsToArray(groupedEvents);

      expect(flatArray).toEqual([
        { eventId: "3", eventTypeId: 2, startTimestamp: 5, category: "single" },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          endTimestamp: 8,
          category: "range",
        },
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 5,
          endTimestamp: 10,
          category: "range",
        },
      ]);
    });
  });

  describe("getOverlappedEvents", () => {
    it("should return events that overlap with the new event", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 3,
          endTimestamp: 8,
          category: "range" as EventCategory,
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "4",
        eventTypeId: 1,
        startTimestamp: 4,
        endTimestamp: 6,
        category: "range" as EventCategory,
      };

      const overlappedEvents = getOverlappedEvents(newEvent, events);

      expect(overlappedEvents).toEqual([
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range",
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 3,
          endTimestamp: 8,
          category: "range",
        },
      ]);
    });

    it("should return an empty array if there are no overlapping events", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 6,
          endTimestamp: 10,
          category: "range" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 11,
        endTimestamp: 15,
        category: "range" as EventCategory,
      };

      const overlappedEvents = getOverlappedEvents(newEvent, events);

      expect(overlappedEvents).toEqual([]);
    });
  });

  describe("insertEventInOrder", () => {
    it("should insert a single event in order", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 3,
        category: "single" as EventCategory,
      };

      const updatedEvents = insertEventInOrder(events, newEvent);

      expect(updatedEvents).toEqual([
        { eventId: "1", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "3", eventTypeId: 1, startTimestamp: 3, category: "single" },
        { eventId: "2", eventTypeId: 1, startTimestamp: 5, category: "single" },
      ]);
    });

    it("should insert a single event at the end", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 10,
        category: "single" as EventCategory,
      };

      const updatedEvents = insertEventInOrder(events, newEvent);

      expect(updatedEvents).toEqual([
        { eventId: "1", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "2", eventTypeId: 1, startTimestamp: 5, category: "single" },
        {
          eventId: "3",
          eventTypeId: 1,
          startTimestamp: 10,
          category: "single",
        },
      ]);
    });

    it("should insert a single event at the beginning", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 0,
        category: "single" as EventCategory,
      };

      const updatedEvents = insertEventInOrder(events, newEvent);

      expect(updatedEvents).toEqual([
        { eventId: "3", eventTypeId: 1, startTimestamp: 0, category: "single" },
        { eventId: "1", eventTypeId: 1, startTimestamp: 5, category: "single" },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 10,
          category: "single",
        },
      ]);
    });

    it("should insert a range event in order", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 10,
          endTimestamp: 15,
          category: "range" as EventCategory,
        },
      ];

      const newEvent = {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 5,
        endTimestamp: 10,
        category: "range" as EventCategory,
      };

      const updatedEvents = insertEventInOrder(events, newEvent);

      expect(updatedEvents).toEqual([
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range",
        },
        {
          eventId: "3",
          eventTypeId: 1,
          startTimestamp: 5,
          endTimestamp: 10,
          category: "range",
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 10,
          endTimestamp: 15,
          category: "range",
        },
      ]);
    });
  });

  describe("removeEvent", () => {
    it("should delete an event by eventId", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
      ];

      const updatedEvents = removeEvent("1", events);

      expect(updatedEvents).toEqual([
        { eventId: "2", eventTypeId: 1, startTimestamp: 5, category: "single" },
      ]);
    });

    it("should not delete any events if the eventId does not exist", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          category: "single" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 5,
          category: "single" as EventCategory,
        },
      ];

      const updatedEvents = removeEvent("3", events);

      expect(updatedEvents).toEqual(events);
    });
  });

  describe("mergeEvents", () => {
    it("should merge overlapping events", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 3,
          endTimestamp: 8,
          category: "range" as EventCategory,
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
        {
          eventId: "4",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single" as EventCategory,
        },
      ];

      const mergedEvents = mergeEvents(events);

      expect(mergedEvents).toEqual([
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 8,
          category: "range",
        },
        {
          eventId: "3",
          eventTypeId: 2,
          startTimestamp: 10,
          category: "single",
        },
      ]);
    });
  });

  describe("splitEvents", () => {
    it("should split overlapping events into separate events", () => {
      const events = [
        {
          eventId: "1",
          eventTypeId: 1,
          startTimestamp: 0,
          endTimestamp: 5,
          category: "range" as EventCategory,
        },
        {
          eventId: "2",
          eventTypeId: 1,
          startTimestamp: 3,
          endTimestamp: 8,
          category: "range" as EventCategory,
        },
      ];

      const newEvents = splitEvents(events);

      expect(newEvents).toHaveLength(3);

      expect(newEvents[0]).toHaveProperty("startTimestamp", 0);
      expect(newEvents[0]).toHaveProperty("endTimestamp", 3);
      expect(newEvents[1]).toHaveProperty("startTimestamp", 3);
      expect(newEvents[1]).toHaveProperty("endTimestamp", 5);
      expect(newEvents[2]).toHaveProperty("startTimestamp", 5);
      expect(newEvents[2]).toHaveProperty("endTimestamp", 8);
    });
  });

  it("should correctly split when there is a single long overlapping event", () => {
    const events = [
      {
        eventId: "1",
        eventTypeId: 1,
        startTimestamp: 0,
        endTimestamp: 5,
        category: "range" as EventCategory,
      },
      {
        eventId: "2",
        eventTypeId: 1,
        startTimestamp: 6,
        endTimestamp: 9,
        category: "range" as EventCategory,
      },
      {
        eventId: "3",
        eventTypeId: 1,
        startTimestamp: 3,
        endTimestamp: 20,
        category: "range" as EventCategory,
      },
      {
        eventId: "4",
        eventTypeId: 1,
        startTimestamp: 8,
        endTimestamp: 12,
        category: "range" as EventCategory,
      },
      {
        eventId: "5",
        eventTypeId: 1,
        startTimestamp: 15,
        endTimestamp: 22,
        category: "range" as EventCategory,
      },
    ];

    const newEvents = splitEvents(events);

    expect(newEvents).toHaveLength(9);

    expect(newEvents[0]).toHaveProperty("startTimestamp", 0);
    expect(newEvents[0]).toHaveProperty("endTimestamp", 3);
    expect(newEvents[1]).toHaveProperty("startTimestamp", 3);
    expect(newEvents[1]).toHaveProperty("endTimestamp", 5);
    expect(newEvents[2]).toHaveProperty("startTimestamp", 5);
    expect(newEvents[2]).toHaveProperty("endTimestamp", 6);
    expect(newEvents[3]).toHaveProperty("startTimestamp", 6);
    expect(newEvents[3]).toHaveProperty("endTimestamp", 8);
    expect(newEvents[4]).toHaveProperty("startTimestamp", 8);
    expect(newEvents[4]).toHaveProperty("endTimestamp", 9);
    expect(newEvents[5]).toHaveProperty("startTimestamp", 9);
    expect(newEvents[5]).toHaveProperty("endTimestamp", 12);
    expect(newEvents[6]).toHaveProperty("startTimestamp", 12);
    expect(newEvents[6]).toHaveProperty("endTimestamp", 15);
    expect(newEvents[7]).toHaveProperty("startTimestamp", 15);
    expect(newEvents[7]).toHaveProperty("endTimestamp", 20);
    expect(newEvents[8]).toHaveProperty("startTimestamp", 20);
    expect(newEvents[8]).toHaveProperty("endTimestamp", 22);
  });
});
