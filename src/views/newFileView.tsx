import { useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import { toast } from "react-toastify";
import { addAnalysis } from "../state/fileController.ts";
import { routes } from "../routes.ts";
import { useOpenFile } from "../hooks/useOpenFile.ts";

import {
  CreateEventTypesForm,
  IEventControl,
  validateEvents,
} from "../forms/createEventTypesForm.tsx";

import styles from "./newFileView.module.scss";



interface INavigationState {
  file?: string;
}

export const NewFileView = () => {
  const { state } = useLocation() as { state: INavigationState | null };
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { fileName, fileSrc } = useOpenFile(state?.file);

  const [analysisName, setAnalysisName] = useState(fileName);

  const [events, setEvents] = useState<IEventControl[]>([]);

  const onSubmit = useCallback(async () => {
    if (!fileName) {
      toast.error("Analysis must have a name");
      return;
    }

    if (!state?.file) {
      toast.error("Analysis must have a video path");
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
      path: state?.file,
      duration: videoDuration,
      eventTypes: events.map(({ formKey, ...event }) => event),
    };

    const id = await addAnalysis(analysisToCreate);

    toast.success("Analysis created");
    navigate(routes.analysis.replace(":id", id.toString(10)));
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
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filePath">File path</label>
          <input
            className={styles.filePathIndicator}
            id="filePath"
            type="text"
            value={state?.file ?? ""}
            readOnly
          />
        </div>
        <figure>
          <figcaption>Video preview</figcaption>
          <video
            className={styles.videoPreview}
            src={fileSrc}
            controls
            ref={videoRef}
          />
        </figure>
        <fieldset className={styles.events}>
          <legend>Events</legend>
          <CreateEventTypesForm events={events} onEventsChange={setEvents} />
        </fieldset>
      </form>
      <button className={styles.submitButton} onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
};
