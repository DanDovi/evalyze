import { useEffect, useRef, useState } from "react";
import { Analysis, getAnalyses } from "../state/fileController";

import { useNavigate } from "react-router";
import { routes } from "../routes.ts";
import { FiPlus } from "react-icons/fi";
import { open } from "@tauri-apps/plugin-dialog";

import styles from "./fileSelectionView.module.scss";
import { FileSummary } from "../components/fileSummary.tsx";


export const FileSelectionView = () => {
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;
    getAnalyses().then((files) => {
      setAnalyses(files);
    });
  }, []);

  const onNewFile = async () => {
    const res = await open({
      multiple: false,
      directory: false,
      title: "Select file",
      filters: [{ name: "Videos", extensions: ["mp4"] }],
    });

    if (res === null) return;

    navigate(routes.newAnalysis, { state: { file: res } });

  };

  return (
    <div className={styles.fileSelectionView}>
      <button className={styles.newFileLink} onClick={onNewFile}>
        New analysis <FiPlus />
      </button>
      <div className={styles.files}>
        {analyses.map((a) => (
          <FileSummary {...a} key={a.id} />
        ))}
      </div>
    </div>
  );
};
