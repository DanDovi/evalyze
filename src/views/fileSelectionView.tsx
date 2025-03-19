import { useEffect, useRef, useState } from "react";
import { getFiles } from "../state/fileController";

import { useNavigate } from "react-router";
import { routes } from "../routes.ts";
import { FiPlus } from "react-icons/fi";
import { open } from "@tauri-apps/plugin-dialog";

import styles from "./fileSelectionView.module.scss";


export const FileSelectionView = () => {
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;
    getFiles().then((files) => {
      setFiles(files);
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

    navigate(routes.newFile, { state: { file: res } });

  };

  return (
    <div className={styles.fileSelectionView}>
      <button className={styles.newFileLink} onClick={onNewFile}>
        New analysis <FiPlus />
      </button>
      <div className={styles.files}>
        {files.map((file) => (
          <div key={file} className={styles.selectableFile}>
            {file}
          </div>
        ))}
      </div>
    </div>
  );
};
