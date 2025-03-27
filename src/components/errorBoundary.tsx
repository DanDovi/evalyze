import { Component, ErrorInfo, ReactNode } from "react";

import styles from "./errorBoundary.module.scss";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorDisplay}>
          <div className={styles.errorContainer}>
            <h1>Something went wrong.</h1>
            <button onClick={() => window.location.reload()}>Return Home</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
