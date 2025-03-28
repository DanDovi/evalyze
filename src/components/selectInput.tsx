import { forwardRef, SelectHTMLAttributes } from "react";

export const SelectInput = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className={`${className ? className : ""} selectInput`}>
      <select ref={ref} {...props}>
        {children}
      </select>
    </div>
  );
});

SelectInput.displayName = "SelectInput";
