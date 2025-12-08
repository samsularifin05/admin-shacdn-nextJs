import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground max-w-md">
                {this.state.error?.message || "An unknown error occurred"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
