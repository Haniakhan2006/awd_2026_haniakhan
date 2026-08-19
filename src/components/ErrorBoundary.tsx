import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7FAF7] dark:bg-[#0A140B] text-[#1B3520] dark:text-[#E8F5E9] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-red-500/20 bg-white/90 dark:bg-[#122214]/90 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">Application Error</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A temporary visual or script issue was encountered. Click reload to refresh the diagnostic console.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-600 font-mono text-left max-h-24 overflow-y-auto break-all">
                {this.state.error.message || "Script Error"}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-[#2E7D32] hover:bg-[#235F26] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/20"
            >
              <RefreshCw className="w-4 h-4" /> Reload Crop Doctor+
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
