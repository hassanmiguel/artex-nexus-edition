"use client";

import * as React from "react";

import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface NexusStatus {
  enabled: boolean;
  url: string;
  reachable: boolean;
  status?: number;
  detail?: string;
}

export default function NexusPage() {
  const [status, setStatus] = React.useState<NexusStatus | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStatus(await api.nexusStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">NEXUS AI</h1>
          <p className="text-muted-foreground text-sm">
            Connected through the ARTEX server-side proxy (no browser CORS issues).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCwIcon className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border p-5 text-sm">
        {error ? (
          <p className="text-destructive">Could not check NEXUS: {error}</p>
        ) : loading || !status ? (
          <p className="text-muted-foreground">Checking NEXUS gateway…</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Gateway</span>
              <Badge variant={status.reachable ? "default" : "destructive"}>
                {status.reachable ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="break-all">
              <span className="text-muted-foreground">Endpoint: </span>
              <code>{status.url}</code>
            </div>
            {typeof status.status === "number" ? (
              <div>
                <span className="text-muted-foreground">Health HTTP status: </span>
                {status.status}
              </div>
            ) : null}
            {status.detail ? (
              <pre className="bg-muted max-h-40 overflow-auto rounded p-3 text-xs whitespace-pre-wrap">
                {status.detail}
              </pre>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (!status?.url) {
              toast.error("NEXUS URL is not available yet");
              return;
            }
            window.open(status.url, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLinkIcon className="mr-2 size-4" />
          Open NEXUS UI
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        Start the bundled gateway with <code>start_nexus.bat</code> (or the
        <code> nexus</code> Docker Compose service), then set
        <code> ARTEX_NEXUS_URL</code> if it is not on <code>http://127.0.0.1:8000</code>.
      </p>
    </div>
  );
}
