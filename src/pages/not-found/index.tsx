import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Number with gradient */}
        <div className="relative mb-8">
          <h1 className="text-[180px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-primary via-primary/80 to-primary/40 select-none sm:text-[240px]">
            404
          </h1>
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
            <div className="h-full w-full bg-linear-to-br from-primary to-primary/40" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto gap-2 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-8 text-muted-foreground/40">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span className="text-sm">Lost?</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span className="text-sm">Find your way</span>
          </div>
        </div>

        {/* Animated Background Circles */}
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </div>
  );
}
