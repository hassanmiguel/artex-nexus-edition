"use client";

import * as React from "react";

import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface NexusStatus {
  enabled: boolean;
  url: string;
  ui_url?: string;
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

  // The embedded UI needs a browser-reachable URL, which can differ from the
  // server-side proxy URL (e.g. http://nexus:8000 inside Docker Compose).
  const uiBase = status?.ui_url || status?.url;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">NEXUS AI</h1>
          <p className="text-muted-foreground text-sm">
            Embedded NEXUS workspace — the gateway runs headlessly on this machine.
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
              <span className="text-muted-foreground">Server endpoint: </span>
              <code>{status.url}</code>
            </div>
            {status.ui_url && status.ui_url !== status.url ? (
              <div className="break-all">
                <span className="text-muted-foreground">Browser URL: </span>
                <code>{status.ui_url}</code>
              </div>
            ) : null}
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

      {status?.reachable ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">NEXUS workspace</h2>
            <a
              href={`${uiBase}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center text-xs underline underline-offset-4"
            >
              <ExternalLinkIcon className="mr-1 size-3" />
              Open standalone
            </a>
          </div>
          <iframe
            title="NEXUS AI"
            src={`${uiBase}/`}
            className="bg-background h-[75vh] w-full rounded-lg border"
          />
        </div>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          NEXUS gateway is offline. Its embedded interface will appear here once the
          gateway is running.
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        The gateway runs headlessly on loopback and its interface is embedded above.
        Access ARTEX from this same machine; to start the gateway separately, use
        <code> start_nexus.bat</code> (or the <code>nexus</code> Compose service).
      </p>
    </div>
  );
}
