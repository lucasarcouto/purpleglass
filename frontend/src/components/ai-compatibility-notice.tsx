import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface AICompatibilityNoticeProps {
  className?: string;
}

export function AICompatibilityNotice({
  className = "",
}: Readonly<AICompatibilityNoticeProps>) {
  const [status] = useState<CompatibilityStatus>(() => checkCompatibility());

  if (status.isCompatible) {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-lg ${className}`}
    >
      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
          AI Features Not Available
        </p>
        <p className="text-yellow-700 dark:text-yellow-400 mb-2">
          Your browser doesn't support the features required for local AI
          processing:
        </p>
        <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-400 space-y-1 mb-3">
          {status.missingFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p className="text-yellow-700 dark:text-yellow-400">
          <strong>Recommended browsers:</strong> Chrome or Edge version 96 or
          later.
        </p>
      </div>
    </div>
  );
}

interface CompatibilityStatus {
  isCompatible: boolean;
  missingFeatures: string[];
}

function checkCompatibility(): CompatibilityStatus {
  const missingFeatures: string[] = [];

  // Check WebGPU support
  if (!("gpu" in navigator)) {
    missingFeatures.push("WebGPU");
  }

  // Check SharedArrayBuffer support (required for WebAssembly)
  if (typeof SharedArrayBuffer === "undefined") {
    missingFeatures.push("SharedArrayBuffer");
  }

  // Check cross-origin isolation (needed for downloading models)
  if (!window.crossOriginIsolated) {
    missingFeatures.push("Cross-origin isolation");
  }

  return {
    isCompatible: missingFeatures.length === 0,
    missingFeatures,
  };
}
