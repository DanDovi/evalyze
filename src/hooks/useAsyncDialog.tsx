import { useState, useRef, useCallback, FC } from "react";
import { Dialog, IDialogProps } from "../components/dialog.tsx";

type DialogResult<T> = T | undefined;

type DialogComponentProps = Omit<IDialogProps, "open">;
type DialogComponent = FC<DialogComponentProps>;

export const useAsyncDialog = <T,>(): [
  DialogComponent,
  {
    open: () => Promise<DialogResult<T>>;
    isOpen: boolean;
    resolve: (value: T) => void;
    reject: () => void;
  },
] => {
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((result: DialogResult<T>) => void) | null>(null);

  const open = useCallback((): Promise<DialogResult<T>> => {
    return new Promise<DialogResult<T>>((resolve) => {
      resolveRef.current = resolve;
      setIsOpen(true);
    });
  }, [setIsOpen]);

  const handleResolve = useCallback((value: T) => {
    resolveRef.current?.(value);
    setIsOpen(false);
  }, []);

  const handleReject = useCallback(() => {
    resolveRef.current?.(undefined);
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleReject();
      }
      setIsOpen(open);
    },
    [handleReject],
  );

  const DialogComponent = useCallback(
    ({ children, onOpenChange, ...props }: DialogComponentProps) => {
      return (
        <Dialog
          open={isOpen}
          onOpenChange={(open: boolean) => {
            handleOpenChange(open);
            onOpenChange?.(open);
          }}
          preventClose={true}
          {...props}
        >
          {children}
        </Dialog>
      );
    },
    [handleOpenChange, isOpen],
  );

  return [
    DialogComponent,
    { open, isOpen, resolve: handleResolve, reject: handleReject },
  ];
};
