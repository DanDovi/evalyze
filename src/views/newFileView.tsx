import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { toast } from "react-toastify";
import { addAnalysis, AddAnalysisParams } from "../state/fileController.ts";
import { routes } from "../routes.ts";
import { getFileNameFromPath, openSingleVideoOpts, useOpenFile } from "../hooks/useOpenFile.ts";

import {
  CreateEventTypesForm,
  IEventControl,
  validateEvents,
} from "../forms/createEventTypesForm.tsx";

import styles from "./newFileView.module.scss";

interface INavigationState {
  file?: string;
}

const validateNewAnalysis = (
  analysis: Partial<AddAnalysisParams>,
): analysis is AddAnalysisParams => {
  let errorCount = 0;

  if (!analysis.name) {
    toast.error("Analysis must have a name");
    errorCount++;
  }

  if (!analysis.path) {
    toast.error("Analysis must have a video path");
    errorCount++;
  }

  const eventErrors = validateEvents(analysis.eventTypes ?? []);

  errorCount += eventErrors.length;

  eventErrors.forEach((eventError) => {
    toast.error(eventError);
  });

  return errorCount === 0;
};

export const NewFileView = () => {
  const { state } = useLocation() as { state: INavigationState | null };
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { fileSrc, filePath, openFileDialog } = useOpenFile(
    state?.file,
  );
  const [analysisName, setAnalysisName] = useState(state?.file ? getFileNameFromPath(state.file) : "");

  const [events, setEvents] = useState<IEventControl[]>([]);

  // If state changes we want to reset the form
  useEffect(() => {

    if(!state?.file) return;

    setAnalysisName(state?.file ? getFileNameFromPath(state.file) : "");
    setEvents([]);
  }, [state?.file]);

  const onSubmit = useCallback(async () => {
    const videoDuration = videoRef.current?.duration ?? 0;

    const analysisToCreate = {
      name: analysisName,
      path: filePath,
      duration: videoDuration,
      eventTypes: events.map(({ formKey, ...event }) => event),
    };

    const success = validateNewAnalysis(analysisToCreate);

    if (!success) {
      return;
    }

    const id = await addAnalysis(analysisToCreate);

    toast.success("Analysis created");
    navigate(routes.analysis.replace(":id", id.toString(10)));
  }, [analysisName, filePath, events]);

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
            value={filePath}
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
        <button
          type="button"
          onClick={() => openFileDialog(openSingleVideoOpts)}
        >
          Select video
        </button>
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
