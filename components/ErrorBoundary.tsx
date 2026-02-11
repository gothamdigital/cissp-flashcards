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
    // Log error to console in development
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
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-8 text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                <AlertCircle className="text-white w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-rose-100">
                We encountered an unexpected error. Don't worry, your progress is safe.
              </p>
            </div>

            {/* Error Details */}
            <div className="p-8 space-y-6">
              {this.state.error && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-rose-400 mb-2">Error Message:</h3>
                  <p className="text-slate-300 font-mono text-sm break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg"
                >
                  <RefreshCcw size={20} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 text-slate-200 rounded-xl font-bold hover:bg-slate-600 transition-all border border-slate-600"
                >
                  <Home size={20} />
                  Reload App
                </button>
              </div>

              {/* Developer Info (only in development) */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 font-medium">
                    Developer Information (Click to expand)
                  </summary>
                  <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
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
