import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error reporting service (e.g., Sentry)
    // reportError(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-4">
          <div className="max-w-lg w-full border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="border-b border-zinc-800 p-8 text-center">
              <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="text-zinc-400 w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-zinc-500 text-sm">
                An unexpected error occurred. Your progress is safe.
              </p>
            </div>

            {/* Error Details */}
            <div className="p-6 space-y-4">
              {this.state.error && (
                <div className="border border-zinc-800 p-4">
                  <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">Error</h3>
                  <p className="text-zinc-400 font-mono text-sm break-all">
                    {import.meta.env.DEV
                      ? this.state.error.message
                      : "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-zinc-950 text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <RefreshCcw size={14} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-zinc-800 text-zinc-400 text-sm font-medium hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Home size={14} />
                  Reload App
                </button>
              </div>

              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-[11px] text-zinc-600 hover:text-zinc-400 font-medium uppercase tracking-wider">
                    Stack Trace
                  </summary>
                  <div className="mt-2 border border-zinc-800 p-4 overflow-auto max-h-64">
                    <pre className="text-xs text-zinc-500 whitespace-pre-wrap font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
