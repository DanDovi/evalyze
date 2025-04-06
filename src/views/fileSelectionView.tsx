import { useEffect, useRef, useState } from "react";
import { Analysis, getAnalyses } from "../state/fileController";

import { useNavigate } from "react-router";
import { routes } from "../routes.ts";
import { FiPlus } from "react-icons/fi";
import { FileSummary } from "../components/fileSummary.tsx";
import { openSingleVideoOpts, useOpenFile } from "../hooks/useOpenFile.ts";

import styles from "./fileSelectionView.module.scss";

export const FileSelectionView = () => {
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  const { openFileDialog } = useOpenFile();

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;
    getAnalyses().then((files) => {
      setAnalyses(files);
    });
  }, []);

  const onNewFile = async () => {
    const res = await openFileDialog(openSingleVideoOpts);
    if (res === null) return;
    console.log(res);
    navigate(routes.newAnalysis, { state: { file: res } });
  };

  return (
    <div className={styles.fileSelectionView}>
      <button className={styles.newFileLink} onClick={onNewFile}>
        New analysis <FiPlus />
      </button>
      {analyses.length ? (
        <div className={styles.files}>
          {analyses.map((a) => (
            <FileSummary {...a} key={a.id} />
          ))}
        </div>
      ) : (
        <div className={styles.noAnalyses}>
          No analyses found. Create a new one to get started.
        </div>
      )}
    </div>
  );
};
