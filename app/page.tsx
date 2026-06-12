"use client";

import { useMemo, useState } from "react";
import { useTournament } from "../context/TournamentContext";
import { computeStats, countPlayedMatches, rankWorstToBest } from "../lib/standings";
import { WoodenSpoonHero } from "../components/WoodenSpoonHero";
import { StandingsTable } from "../components/StandingsTable";
import { GroupTabs } from "../components/GroupTabs";
import { MatchEditor } from "../components/MatchEditor";
import { SyncPanel } from "../components/SyncPanel";

export default function Home() {
  const { matches } = useTournament();
  const [group, setGroup] = useState("ALL");

  const stats = useMemo(() => computeStats(matches), [matches]);
  const playedCount = useMemo(() => countPlayedMatches(matches), [matches]);

  const overallWorstToBest = useMemo(() => rankWorstToBest(stats), [stats]);
  const worst = playedCount > 0 ? overallWorstToBest[0] : null;

  const visible = useMemo(() => {
    const filtered =
      group === "ALL"
        ? overallWorstToBest
        : stats.filter((s) => s.team.group === group);
    return group === "ALL" ? filtered : rankWorstToBest(filtered);
  }, [group, overallWorstToBest, stats]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          FIFA World Cup 2026 · 11 Jun – 19 Jul
        </p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">
          Wooden Spoon Watch
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A running tracker for the worst-placed team across all 48 nations,
          ranked by points, then goal difference, then disciplinary record
          (yellow and red cards).
        </p>
      </header>

      <WoodenSpoonHero
        worst={worst}
        playedCount={playedCount}
        totalMatches={matches.length}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold">Standings</h2>
          <GroupTabs active={group} onChange={setGroup} />
        </div>

        <StandingsTable
          stats={visible}
          worstTeamId={worst?.team.id}
          showGroupColumn={group === "ALL"}
        />

        <p className="text-xs text-muted">
          Sorted worst → best. Disciplinary points = 1 per yellow card + 4
          per red card; a higher total is a worse record. Ties are broken in
          this order: points, goal difference, goals scored, disciplinary
          points, then team name.
        </p>
      </section>

      <SyncPanel />

      <MatchEditor />

      <footer className="border-t border-line pt-6 text-xs text-muted">
        Group draw confirmed at the FIFA final draw on 5 December 2025. Group
        stage fixtures are generated using a standard round-robin pattern;
        adjust results above as actual matches are played. Built with Next.js
        and TypeScript.
      </footer>
    </main>
  );
}
