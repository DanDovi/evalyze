export const sortedInsert = <T extends object>(
  array: T[],
  value: T,
  accessorKey: keyof T,
) => {
  const arr = [...array];
  const index = arr.findIndex((item) => item[accessorKey] > value[accessorKey]);
  if (index === -1) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }

  return arr;
};
