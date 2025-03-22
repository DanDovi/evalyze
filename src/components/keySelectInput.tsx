import { forwardRef, SelectHTMLAttributes } from "react";
import { SelectInput } from "./selectInput.tsx";

const keys = "abcdefghijklmnopqrstuvwxyz".split("");

export const KeySelectInput = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => {
  return (
    <SelectInput ref={ref} {...props}>
      {keys.map((key) => (
        <option key={key} value={key}>{key}</option>
      ))}
    </SelectInput>
  );
});
