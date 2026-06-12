"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTournament } from "../context/TournamentContext";
import { SyncResponse } from "../lib/types";

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes - stays well under free-tier rate limits

export function SyncPanel() {
  const { applyResults } = useTournament();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [response, setResponse] = useState<SyncResponse | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const sync = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      const data: SyncResponse = await res.json();
      setResponse(data);
      setStatus(data.ok ? "success" : "error");
      if (data.ok) {
        applyResults(data.results);
        setLastSynced(new Date());
      }
    } catch (err) {
      setResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        results: [],
        unmatched: [],
        source: "football-data.org",
        fetchedAt: new Date().toISOString(),
      });
      setStatus("error");
    }
  }, [applyResults]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      sync();
      intervalRef.current = setInterval(sync, AUTO_REFRESH_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  return (
    <section className="rounded-2xl border border-line bg-panel shadow-plate p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Live results sync
          </h2>
          <p className="mt-1 text-sm text-muted">
            Pulls finished and in-progress group-stage scores from{" "}
            <span className="text-paper">football-data.org</span> and fills
            them in automatically. Card data only comes through if your API
            plan includes match bookings — otherwise enter cards manually
            below.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            onClick={sync}
            disabled={status === "loading"}
            className="rounded-lg bg-spoon px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Syncing…" : "Sync now"}
          </button>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-3.5 w-3.5 accent-spoon"
            />
            Auto-refresh every 5 minutes
          </label>
        </div>
      </div>

      <div className="mt-4 text-xs">
        {status === "idle" && (
          <p className="text-muted">Not synced yet this session.</p>
        )}

        {status === "loading" && (
          <p className="text-muted">Fetching the latest results…</p>
        )}

        {status === "success" && response && (
          <div className="space-y-1">
            <p className="text-pitch">
              Synced {response.results.length} match
              {response.results.length === 1 ? "" : "es"} with a recorded
              score
              {lastSynced &&
                ` · last updated ${lastSynced.toLocaleTimeString()}`}
              .
            </p>
            {response.unmatched.length > 0 && (
              <p className="text-spoonlight">
                Couldn&rsquo;t match {response.unmatched.length} fixture
                {response.unmatched.length === 1 ? "" : "s"} to a known team:{" "}
                {response.unmatched
                  .map((u) => `${u.homeName} vs ${u.awayName}`)
                  .join(", ")}
                . Check the alias list in{" "}
                <code className="text-paper">lib/teamAliases.ts</code>.
              </p>
            )}
          </div>
        )}

        {status === "error" && response && (
          <p className="text-alert">{response.error}</p>
        )}
      </div>
    </section>
  );
}
