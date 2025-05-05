import React from "react";
import {
  AnalysisEventSummary,
  AnalysisEventType,
  saveEventsToCsv,
} from "../state/fileController.ts";
import { FiDownload, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";

import styles from "./rawEventPanel.module.scss";

interface IRawEventPanelProps {
  analysisId: number;
  eventTypes: AnalysisEventType[];
  events: AnalysisEventSummary[];
  onDeleteEvent: (eventId: string, eventTypeId: number) => void;
  isPlaying?: boolean;
  isOpen?: boolean;
}

export const RawEventPanel = ({
  analysisId,
  events,
  eventTypes,
  onDeleteEvent,
  isPlaying,
  isOpen,
}: IRawEventPanelProps) => {
  const eventNames = React.useMemo(() => {
    return eventTypes.reduce(
      (acc, event) => {
        acc[event.id] = event.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [eventTypes]);

  const hasInProgressEvents = React.useMemo(() => {
    return events.some(
      (event) => event.category === "range" && !event.endTimestamp,
    );
  }, [events]);

  const exportButtonDisabled =
    events.length === 0 || !analysisId || isPlaying || hasInProgressEvents;

  return (
    <div className={styles.rawEventPanel} data-open={isOpen}>
      <div className={styles.header}>
        <h2>Raw Events</h2>
        <button
          type="button"
          className={styles.exportButton}
          disabled={exportButtonDisabled}
          onClick={async () =>
            saveEventsToCsv(analysisId, events)
              .then(() => {
                toast.success("CSV exported successfully");
              })
              .catch((error) => {
                toast.error(`Error exporting CSV: ${error.message}`);
              })
          }
        >
          <span>Export CSV </span>
          <FiDownload />
        </button>
      </div>
      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Start Time (s)</th>
              <th>End Time (s)</th>
              <th></th>
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
                  <td>
                    <button
                      className={styles.deleteButton}
                      disabled={isPlaying}
                      onClick={() =>
                        onDeleteEvent(event.eventId, event.eventTypeId)
                      }
                    >
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
