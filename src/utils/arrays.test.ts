import { sortedInsert } from "./arrays.ts";
import { describe } from "@jest/globals";

describe("sortInserts", () => {
  it("should insert a value in a sorted array", () => {
    const array = [{ id: 1 }, { id: 3 }, { id: 5 }];
    const value = { id: 4 };
    const result = sortedInsert(array, value, "id");
    expect(result).toEqual([{ id: 1 }, { id: 3 }, { id: 4 }, { id: 5 }]);
  });

  it("should insert a value at the beginning of the array", () => {
    const array = [{ id: 1 }, { id: 3 }, { id: 5 }];
    const value = { id: 0 };
    const result = sortedInsert(array, value, "id");
    expect(result).toEqual([{ id: 0 }, { id: 1 }, { id: 3 }, { id: 5 }]);
  });

  it("should insert a value at the end of the array", () => {
    const array = [{ id: 1 }, { id: 3 }, { id: 5 }];
    const value = { id: 6 };
    const result = sortedInsert(array, value, "id");
    expect(result).toEqual([{ id: 1 }, { id: 3 }, { id: 5 }, { id: 6 }]);
  });

  it("should insert a value in an empty array", () => {
    const array = [] as { id: number }[];
    const value = { id: 1 };
    const result = sortedInsert(array, value, "id");
    expect(result).toEqual([{ id: 1 }]);
  });
});
