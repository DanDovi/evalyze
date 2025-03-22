import { snakeCase, camelCase } from "change-case";

const transformArray = <T,>(arr: T[], transformFn: (key: string) => string): unknown[] => {
  return arr.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return transformObject(item, transformFn);
    } else if (Array.isArray(item)) {
      return transformArray(item, transformFn);
    }
    return item;
  });
};

const transformObject = (obj: Record<string, any>, transformFn: (key: string) => string) => {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    let val = obj[key];

    if (typeof val === "object" && !Array.isArray(val)) {
      val = transformObject(val, transformFn);
    } else if (Array.isArray(val)) {
      val = transformArray(val, transformFn);
    }
    newObj[transformFn(key)] = val;
  }
  return newObj;
};

export const rustifyArray = <T,>(arr: T[]): unknown[] => transformArray(arr, snakeCase);
export const rustifyObject = (obj: Record<string, any>) => transformObject(obj, snakeCase);
export const unRustifyArray = <T,>(arr: T[]): unknown[] => transformArray(arr, camelCase);
export const unRustifyObject = (obj: Record<string, any>) => transformObject(obj, camelCase);