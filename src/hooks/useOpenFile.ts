import React from "react";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open, OpenDialogOptions } from "@tauri-apps/plugin-dialog";

export const openSingleVideoOpts: OpenDialogOptions = {
  multiple: false,
  directory: false,
  title: "Select file",
  filters: [{ name: "Videos", extensions: ["mp4"] }],
};

const getFileNameFromPath = (path: string) => {
  const parts = path.split("/");
  return parts[parts.length - 1];
};

export const useOpenFile = (initialPath?: string) => {
  const [filePath, setFilePath] = useState<string | undefined>(initialPath);

  const fileSrc = React.useMemo(() => {
    if (!filePath) {
      return;
    }
    return convertFileSrc(filePath ?? "");
  }, [filePath]);

  const fileName = React.useMemo(() => {
    if (!filePath) {
      return;
    }
    return getFileNameFromPath(filePath);
  }, [filePath]);

  const openFileDialog = React.useCallback(
    async (opts: OpenDialogOptions) => {
      const res = await open(opts);
      if (!res) {
        return;
      }

      setFilePath(res);

      return res;
    },
    [filePath],
  );
  return {
    fileName,
    filePath,
    fileSrc,
    openFileDialog,
  };
};
