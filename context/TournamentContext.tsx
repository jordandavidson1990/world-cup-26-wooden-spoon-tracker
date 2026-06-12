"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { generateFixtures } from "../lib/fixtures";
import { Match, SyncedResult } from "../lib/types";

const STORAGE_KEY = "wc26-wooden-spoon-matches";

interface TournamentContextValue {
  matches: Match[];
  /** Replace a single match record (used by the result editor). */
  updateMatch: (match: Match) => void;
  /** Merge results fetched from an external API into the fixture list. */
  applyResults: (results: SyncedResult[]) => void;
  /** Wipe all entered results back to a clean, unplayed fixture list. */
  resetAll: () => void;
  /** True once the saved data has been loaded from localStorage. */
  isLoaded: boolean;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

export function TournamentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [matches, setMatches] = useState<Match[]>(() => generateFixtures());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load any previously saved results once, on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Match[] = JSON.parse(raw);
        // Guard against stale saved data not matching the current fixture
        // list (e.g. after a code update) by merging onto fresh fixtures.
        const fresh = generateFixtures();
        const byId = new Map(saved.map((m) => [m.id, m]));
        setMatches(fresh.map((m) => byId.get(m.id) ?? m));
      }
    } catch {
      // Ignore malformed/unavailable storage and fall back to fixtures.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist on every change, once initial load has happened.
  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    } catch {
      // Storage may be unavailable (private browsing, quota, etc.) - safe to ignore.
    }
  }, [matches, isLoaded]);

  const updateMatch = useCallback((updated: Match) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  }, []);

  /**
   * Merges results fetched from an external API into the fixture list.
   * Matches are paired up by team ids regardless of which side the API
   * lists as "home" vs "away". Card counts are only overwritten if the
   * synced result actually includes them.
   */
  const applyResults = useCallback((results: SyncedResult[]) => {
    setMatches((prev) =>
      prev.map((m) => {
        const r = results.find(
          (r) =>
            (r.homeId === m.home && r.awayId === m.away) ||
            (r.homeId === m.away && r.awayId === m.home)
        );
        if (!r) return m;

        const sameOrder = r.homeId === m.home;
        const updated: Match = {
          ...m,
          homeScore: sameOrder ? r.homeScore : r.awayScore,
          awayScore: sameOrder ? r.awayScore : r.homeScore,
        };

        if (r.homeYellow !== undefined && r.awayYellow !== undefined) {
          updated.homeYellow = sameOrder ? r.homeYellow : r.awayYellow;
          updated.awayYellow = sameOrder ? r.awayYellow : r.homeYellow;
        }
        if (r.homeRed !== undefined && r.awayRed !== undefined) {
          updated.homeRed = sameOrder ? r.homeRed : r.awayRed;
          updated.awayRed = sameOrder ? r.awayRed : r.homeRed;
        }

        return updated;
      })
    );
  }, []);

  const resetAll = useCallback(() => {
    setMatches(generateFixtures());
  }, []);

  const value = useMemo(
    () => ({ matches, updateMatch, applyResults, resetAll, isLoaded }),
    [matches, updateMatch, applyResults, resetAll, isLoaded]
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return ctx;
}
