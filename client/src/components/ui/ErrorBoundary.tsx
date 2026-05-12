import React from "react";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-xl font-black mb-2">Something went wrong</h1>
          <p className="text-sm text-on-surface-variant mb-6">Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-sm"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
