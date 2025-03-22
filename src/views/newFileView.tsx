import { useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";
import { FiPlus, FiTrash } from "react-icons/fi";
import { KeySelectInput } from "../components/keySelectInput.tsx";
import { SelectInput } from "../components/selectInput.tsx";
import { toast } from "react-toastify";

import styles from "./newFileView.module.scss";
import { addAnalysis, AnalysisEventType } from "../state/fileController.ts";
import { routes } from "../routes.ts";

const getFileNameFromPath = (path: string) => {
  const parts = path.split("/");
  return parts[parts.length - 1];
};

interface INavigationState {
  file?: string;
}

type IEventControl = Omit<AnalysisEventType, "id" | "analysisId"> & {
  formKey: number;
}

const validateEvents = (events: IEventControl[]) => {
  const trimmedNames = events.map((event) =>
    event.name.trim().trim().toLowerCase(),
  );
  const allEventsHaveName = trimmedNames.every((name) => name.length > 0);

  if (!allEventsHaveName) {
    return ["All events must have a name"];
  }

  const namesAreUnique = trimmedNames.every((name, i, arr) => {
    return arr.findIndex((n) => name === n) === i;
  });

  const keysAreUnique = events.every((event, i) => {
    return events.findIndex((e) => e.keyboardKey === event.keyboardKey) === i;
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
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const path = (state as INavigationState).file ?? "";

  const [fileName, setFileName] = useState<string | undefined>(
    getFileNameFromPath((state as INavigationState).file ?? ""),
  );
  const [events, setEvents] = useState<IEventControl[]>([]);

  const videoSrc = useMemo(() => {
    return convertFileSrc(state.file ?? "");
  }, [state.file]);

  const onAddEvent = useCallback(() => {
    const maxFormKey = events.reduce((max, event) => {
      return event.formKey > max ? event.formKey : max;
    }, 0);
    setEvents([...events, { name: "", keyboardKey: "a", category: "single", formKey: maxFormKey + 1 }]);
  }, [events]);

  const onDeleteEvent = useCallback((index: number) => {
    setEvents((prev) => {
      const newEvents = [...prev];
      newEvents.splice(index, 1);
      return newEvents;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    if (!fileName) {
      toast.error("Analysis must have a name");
      return;
    }

    const errors = validateEvents(events);

    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    const videoDuration = videoRef.current?.duration ?? 0;

    const analysisToCreate = {
      name: fileName,
      path,
      duration: videoDuration,
      eventTypes: events.map(({formKey, ...event}) => event),
    };

    const id = await addAnalysis(analysisToCreate);

    toast.success("Analysis created");
    navigate(routes.analysis.replace(':id', id.toString(10)));
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
          <video
            className={styles.videoPreview}
            src={videoSrc}
            controls
            ref={videoRef}
          />
        </figure>
        <fieldset className={styles.events}>
          <legend>Events</legend>
          {events.map((event, i) => {
            const { name, keyboardKey, category, formKey } = event;
            const onEventChange = (key: keyof IEventControl, value: string) => {
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
              <div key={formKey} className={styles.eventRow}>
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
                    value={category}
                    onChange={(e) => onEventChange("category", e.target.value)}
                  >
                    <option key='single' value="single">Single</option>
                    <option key='range' value="range">Range</option>
                  </SelectInput>
                </span>
                <span>
                  <label htmlFor={`event.${i}.key`}>Event Key</label>
                  <KeySelectInput
                    id={`event.${i}.key`}
                    value={keyboardKey}
                    onChange={(e) => onEventChange("keyboardKey", e.target.value)}
                  />
                </span>
                <span>
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => onDeleteEvent(i)}
                  >
                    <FiTrash size={20} />
                  </button>
                </span>
              </div>
            );
          })}
          <button
            className={styles.addEventButton}
            type="button"
            onClick={onAddEvent}
          >
            <span>Add event</span> <FiPlus />
          </button>
        </fieldset>
      </form>
      <button className={styles.submitButton} onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
};
