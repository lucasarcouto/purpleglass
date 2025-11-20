import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backendData"],
    queryFn: fetchBackendData,
  });

  return (
    <div className="flex items-center justify-center p-8 min-h-screen">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-foreground mb-8">PurpleGlass</h1>

        <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-6">
            React + Node.js App
          </h2>

          {isLoading && (
            <p className="text-muted-foreground">
              Loading data from backend...
            </p>
          )}

          {error && (
            <p className="text-destructive">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          )}

          {data && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                <strong className="text-card-foreground">
                  Message from backend:
                </strong>{" "}
                {data.message}
              </p>
              <p className="text-muted-foreground">
                <strong className="text-card-foreground">Timestamp:</strong>{" "}
                {data.timestamp}
              </p>
            </div>
          )}

          <Button className="mt-4" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BackendData {
  message: string;
  timestamp: string;
}

async function fetchBackendData(): Promise<BackendData> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/data`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
}
