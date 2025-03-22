import { invoke } from "@tauri-apps/api/core";
import { rustifyObject, unRustifyObject } from "../utils/rusitfy.ts";


export type Analysis = {
  id: string;
  name: string;
  duration: number;
  path: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

export type AnalysisEventType = {
  id: string
  analysisId: string;
  keyboardKey: string;
  name: string;
  category: "single" | "range";
}

export type AnalysisWithEventTypes = {
  analysisData: Analysis;
  eventTypes: Array<AnalysisEventType>
}

export const getAnalyses = async () => {
  return (await invoke("get_all_analyses")) as Analysis[];
};


type AddAnalysisParams = Omit<Analysis, "id" | "created_at" | "updated_at" | "last_opened_at"> & {
  eventTypes: Array<Omit<AnalysisEventType, "id" | "analysisId">>
}

export const addAnalysis = async (params: AddAnalysisParams): Promise<number> => {
  return (await invoke("add_analysis", { params: rustifyObject(params) })) as number;
};

export const getAnalysisById = async (id: number): Promise<AnalysisWithEventTypes> => {
  return unRustifyObject(await invoke("get_analysis_by_id", { id })) as AnalysisWithEventTypes;
};