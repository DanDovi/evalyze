import { invoke } from "@tauri-apps/api/core";
import {
  rustifyArray,
  rustifyObject,
  unRustifyArray,
  unRustifyObject,
} from "../utils/rusitfy.ts";

export type EventCategory = "single" | "range";

export type Analysis = {
  id: number;
  name: string;
  duration: number;
  path: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
};

export type AnalysisEventType = {
  id: number;
  analysisId: string;
  keyboardKey: string;
  name: string;
  category: EventCategory;
};

export type AnalysisEventSummary = {
  eventId: string;
  eventTypeId: number;
  category: EventCategory;
  startTimestamp: number;
  endTimestamp?: number;
};

export type AnalysisWithEventTypes = {
  analysisData: Analysis;
  eventTypes: Array<AnalysisEventType>;
};

export const getAnalyses = async () => {
  return unRustifyArray(await invoke("get_all_analyses")) as Analysis[];
};

export type AddAnalysisParams = Omit<
  Analysis,
  "id" | "createdAt" | "updatedAt" | "lastOpenedAt"
> & {
  eventTypes: Array<Omit<AnalysisEventType, "id" | "analysisId">>;
};

export const addAnalysis = async (
  params: AddAnalysisParams,
): Promise<number> => {
  return (await invoke("add_analysis", {
    params: rustifyObject(params),
  })) as number;
};

export const getAnalysisById = async (
  id: number,
): Promise<AnalysisWithEventTypes> => {
  return unRustifyObject(
    await invoke("get_analysis_by_id", { id }),
  ) as AnalysisWithEventTypes;
};

export const saveEventsToCsv = async (
  analysisId: number,
  events: AnalysisEventSummary[],
) => {
  const rustifiedEvents = rustifyArray(
    events.map(({ category, ...event }) => ({
      ...event,
    })),
  );

  return await invoke("save_events_to_csv", {
    analysisId,
    events: rustifiedEvents,
  });
};
