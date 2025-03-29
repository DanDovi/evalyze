import {
  AnalysisEventSummary,
  AnalysisEventType,
} from "../state/fileController.ts";
import React from "react";

import styles from "./rawEventPanel.module.scss";

interface IRawEventPanelProps {
  eventTypes: AnalysisEventType[];
  events: AnalysisEventSummary[];
}

export const RawEventPanel = ({ events, eventTypes }: IRawEventPanelProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const eventNames = React.useMemo(() => {
    return eventTypes.reduce(
      (acc, event) => {
        acc[event.id] = event.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [eventTypes]);

  return (
    <div className={styles.rawEventPanel} data-open={isOpen}>
      <h2>Raw Events</h2>
      <table>
        <thead>
          <tr>
            <th>Event Type</th>
            <th>Start Time (s)</th>
            <th>End Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const eventName = eventNames[event.eventTypeId];
            return (
              <tr
                key={`${eventName}-${event.startTimestamp}-${event.endTimestamp}`}
              >
                <td>{eventName}</td>
                <td>{event.startTimestamp.toFixed(2)}</td>
                <td>{event.endTimestamp?.toFixed(2) ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className={styles.openButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Hide Raw Events" : "Show Raw Events"}
      </button>
    </div>
  );
};
