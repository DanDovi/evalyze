import { useEffect, useState } from "react";
import {
  AnalysisWithEventTypes,
  getAnalysisById,
} from "../state/fileController.ts";
import { formatSeconds } from "../utils/time.ts";
import { formatDate } from "../utils/dates.ts";
import { useParams } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";

export const AnalysisView = () => {
  let { id } = useParams();

  const [analysis, setAnalysis] = useState<AnalysisWithEventTypes | null>(null);

  useEffect(() => {
    if (!id) return;
    getAnalysisById(parseInt(id, 10)).then(setAnalysis);
  }, [id]);

  if (!analysis) return <div>Loading...</div>;

  return (
    <div>
      <h1>{analysis.analysisData.name}</h1>
      <div>
        <div>{`Duration: ${formatSeconds(analysis.analysisData.duration)}`}</div>
        <div>{`Last opened: ${formatDate(analysis.analysisData.last_opened_at)}`}</div>
      </div>
      <video style={{maxWidth: '80%'}} src={convertFileSrc(analysis.analysisData.path)} controls />
      <div>
        {analysis.eventTypes?.map((event) => (
          <div key={event.id}>
            <div>{event.name}</div>
            <div>{event.category}</div>
            <div>{event.keyboardKey}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
