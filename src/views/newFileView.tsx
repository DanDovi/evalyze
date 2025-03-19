import { useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";
import { FiPlus } from "react-icons/fi";
import { KeySelectInput } from "../components/keySelectInput.tsx";
import { SelectInput } from "../components/selectInput.tsx";
import { toast } from "react-toastify";

import styles from "./newFileView.module.scss";


const getFileNameFromPath = (path: string) => {
  const parts = path.split("/");
  return parts[parts.length - 1];
};

interface INavigationState {
  file?: string;
}

interface IEventControl {
  name: string;
  key: string;
  type: "single" | "range";
}

const validateEvents = (events: IEventControl[]) => {
  const trimmedNames = events.map((event) => event.name.trim().trim().toLowerCase());
  const allEventsHaveName = trimmedNames.every((name) => name.length > 0);

  if (!allEventsHaveName) {
    return ["All events must have a name"];
  }

  const namesAreUnique = trimmedNames.every((name, i, arr) => {
    return arr.findIndex((n) => name === n) === i;
  });

  const keysAreUnique = events.every((event, i) => {
    return events.findIndex((e) => e.key === event.key) === i;
  });

  const errors = [];

  if (!namesAreUnique) {
    errors.push("All event names must be unique");
  }

  if (!keysAreUnique) {
    errors.push("All event keys must be unique");
  }

  return errors;
};

export const NewFileView = () => {
  const { state } = useLocation() as { state: INavigationState };

  const path = (state as INavigationState).file ?? "";

  const [fileName, setFileName] = useState<string | undefined>(
    getFileNameFromPath((state as INavigationState).file ?? ""),
  );
  const [events, setEvents] = useState<IEventControl[]>([]);

  const videoSrc = useMemo(() => {
    return convertFileSrc(state.file ?? "");
  }, [state.file]);

  const onAddEvent = useCallback(() => {
    setEvents([...events, { name: "", key: "a", type: "single" }]);
  }, [events]);

  const onDeleteEvent = useCallback((index: number) => {
    setEvents((prev) => {
      const newEvents = [...prev];
      newEvents.splice(index, 1);
      return newEvents;
    });
  }, []);

  const onSubmit = useCallback(() => {
    const errors = validateEvents(events);

    if (errors.length > 0) {
      errors.forEach((error) => {toast.error(error)})
      return;
    }

    toast.success("Analysis created");
  }, [fileName, events]);

  return (
    <div className={styles.newFileView}>
      <h1>New analysis</h1>
      <form>
        <div>
          <label htmlFor={"name"}>Analysis Name</label>
          <input
            id="name"
            type="text"
            placeholder="Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filePath">File path</label>
          <input
            className={styles.filePathIndicator}
            id="filePath"
            type="text"
            value={path}
            readOnly
          />
        </div>
        <figure>
          <figcaption>Video preview</figcaption>
          <video className={styles.videoPreview} src={videoSrc} controls />
        </figure>
        <fieldset className={styles.events}>
          <legend>Events</legend>
          {events.map((event, i) => {
            const { name, key, type } = event;
            const onEventChange = (key: string, value: string) => {
              setEvents((prev) => {
                const newEvents = [...prev];
                newEvents[i] = {
                  ...newEvents[i],
                  [key]: value,
                };
                return newEvents;
              });
            };

            return (
              <div className={styles.eventRow}>
                <span>
                  <label htmlFor={`event.${i}.name`}>Event Name</label>
                  <input
                    id={`event.${i}.name`}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => onEventChange("name", e.target.value)}
                  />
                </span>
                <span>
                  <label htmlFor={`event.${i}.type`}>Event Type</label>
                  <SelectInput
                    id={`event.${i}.type`}
                    value={type}
                    onChange={(e) => onEventChange("type", e.target.value)}
                  >
                    <option value="single">Single</option>
                    <option value="range">Range</option>
                  </SelectInput>
                </span>
                <span>
                  <label htmlFor={`event.${i}.key`}>Event Key</label>
                  <KeySelectInput
                    id={`event.${i}.key`}
                    value={key}
                    onChange={(e) => onEventChange("key", e.target.value)}
                  />
                </span>
                <span>
                  <button type="button" onClick={() => onDeleteEvent(i)}>
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
          <button type="button" onClick={onAddEvent}>
            <span>Add event</span> <FiPlus />
          </button>
        </fieldset>
      </form>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
