/**
 * Top-level React error boundary for unexpected render failures.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/lib/logger";
import { telemetry } from "@/lib/telemetry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("Unhandled render error", { name: error.name, message: error.message });
    telemetry.captureException(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}
