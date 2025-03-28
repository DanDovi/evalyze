import { snakeCase, camelCase } from "change-case";

const transformArray = <T>(
  arr: T,
  transformFn: (key: string) => string,
): unknown[] => {
  if (!Array.isArray(arr)) {
    throw new Error("Invalid array");
  }

  return arr.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return transformObject(item, transformFn);
    } else if (Array.isArray(item)) {
      return transformArray(item, transformFn);
    }
    return item;
  });
};

const isRecord = (val: unknown): val is Record<string, unknown> => {
  return val !== null && typeof val === "object" && !Array.isArray(val);
};

const transformObject = (
  obj: Record<string, unknown>,
  transformFn: (key: string) => string,
) => {
  const newObj: Record<string, unknown> = {};
  for (const key in obj) {
    let val = obj[key];

    if (isRecord(val)) {
      newObj[key] = transformArray(val, transformFn);
      val = transformObject(val, transformFn);
    } else if (Array.isArray(val)) {
      val = transformArray(val, transformFn);
    }
    newObj[transformFn(key)] = val;
  }
  return newObj;
};

export const rustifyArray = <T>(arr: T[]): unknown[] =>
  transformArray(arr, snakeCase);
export const rustifyObject = (obj: Record<string, unknown>) =>
  transformObject(obj, snakeCase);
export const unRustifyArray = <T>(arr: T): unknown[] =>
  transformArray(arr, camelCase);
export const unRustifyObject = (obj: Record<string, unknown>) =>
  transformObject(obj, camelCase);
