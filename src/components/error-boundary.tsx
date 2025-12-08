import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RootErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorMessage =
      error.statusText || error.data?.message || "An error occurred";
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unknown error occurred";
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <div className="space-y-2">
          {errorStatus && (
            <h1 className="text-4xl font-bold tracking-tight">{errorStatus}</h1>
          )}
          <h2 className="text-2xl font-semibold tracking-tight">
            {errorStatus === 404
              ? "Page Not Found"
              : "Oops! Something went wrong"}
          </h2>
          <p className="text-muted-foreground max-w-md">{errorMessage}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}
