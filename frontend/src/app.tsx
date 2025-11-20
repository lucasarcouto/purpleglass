import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/core/theme/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

interface BackendData {
  message: string;
  timestamp: string;
}

function AppContent() {
  const [backendData, setBackendData] = useState<BackendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function refreshData() {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/data`)
      .then((response) => response.json())
      .then((data: BackendData) => {
        setBackendData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-foreground mb-8">PurpleGlass</h1>

        <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-6">
            React + Node.js App
          </h2>

          {loading && (
            <p className="text-muted-foreground">
              Loading data from backend...
            </p>
          )}
          {error && <p className="text-destructive">Error: {error}</p>}

          {backendData && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                <strong className="text-card-foreground">
                  Message from backend:
                </strong>{" "}
                {backendData.message}
              </p>
              <p className="text-muted-foreground">
                <strong className="text-card-foreground">Timestamp:</strong>{" "}
                {backendData.timestamp}
              </p>
            </div>
          )}

          <Button className="mt-4" onClick={refreshData}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
