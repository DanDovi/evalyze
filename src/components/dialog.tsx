import React from "react";
import { Root, Content, Overlay } from "@radix-ui/react-dialog";

import styles from "./dialog.module.scss";

export interface IDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  preventClose?: boolean;
}

export const Dialog = ({
  open,
  onOpenChange,
  preventClose,
  children,
}: IDialogProps) => {
  // Prevent closing the dialog when clicking outside or pressing escape
  const handleClose = React.useCallback(
    (event: UIEvent | CustomEvent) => {
      if (preventClose) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [preventClose],
  );

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Overlay className={styles.overlay} />
      <Content
        className={styles.content}
        onEscapeKeyDown={handleClose}
        onPointerDownOutside={handleClose}
        onInteractOutside={handleClose}
      >
        {children}
      </Content>
    </Root>
  );
};
