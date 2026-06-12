"use client";

import { useState } from "react";
import { useTournament } from "../context/TournamentContext";
import { teamById, teamsByGroup, GROUP_IDS } from "../lib/teams";
import { GroupId, Match, Matchday } from "../lib/types";

function NumberField({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  accent?: "yellow" | "red";
}) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : Math.max(0, Number(raw)));
        }}
        className={`w-14 rounded-md border bg-ink px-2 py-1.5 text-center text-sm tabular-nums text-paper focus:border-spoonlight ${
          accent === "yellow"
            ? "border-yellow-500/40"
            : accent === "red"
            ? "border-alert/40"
            : "border-line"
        }`}
      />
    </label>
  );
}

function MatchRow({
  match,
  onSave,
}: {
  match: Match;
  onSave: (m: Match) => void;
}) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  const [draft, setDraft] = useState<Match>(match);

  const dirty = JSON.stringify(draft) !== JSON.stringify(match);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-ink/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="flex items-center gap-2">
          <span aria-hidden>{home?.flag ?? "🏳️"}</span>
          {home?.name}
        </span>
        <span className="text-muted">vs</span>
        <span className="flex items-center gap-2">
          <span aria-hidden>{away?.flag ?? "🏳️"}</span>
          {away?.name}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <NumberField
          label={home?.id ?? "Home"}
          value={draft.homeScore}
          onChange={(v) => setDraft((d) => ({ ...d, homeScore: v }))}
        />
        <NumberField
          label={away?.id ?? "Away"}
          value={draft.awayScore}
          onChange={(v) => setDraft((d) => ({ ...d, awayScore: v }))}
        />
        <NumberField
          label={`${home?.id} 🟨`}
          value={draft.homeYellow}
          accent="yellow"
          onChange={(v) => setDraft((d) => ({ ...d, homeYellow: v ?? 0 }))}
        />
        <NumberField
          label={`${away?.id} 🟨`}
          value={draft.awayYellow}
          accent="yellow"
          onChange={(v) => setDraft((d) => ({ ...d, awayYellow: v ?? 0 }))}
        />
        <NumberField
          label={`${home?.id} 🟥`}
          value={draft.homeRed}
          accent="red"
          onChange={(v) => setDraft((d) => ({ ...d, homeRed: v ?? 0 }))}
        />
        <NumberField
          label={`${away?.id} 🟥`}
          value={draft.awayRed}
          accent="red"
          onChange={(v) => setDraft((d) => ({ ...d, awayRed: v ?? 0 }))}
        />

        <button
          onClick={() => onSave(draft)}
          disabled={!dirty}
          className="ml-1 rounded-lg bg-spoon px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-30"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function MatchEditor() {
  const { matches, updateMatch, resetAll } = useTournament();
  const [group, setGroup] = useState<GroupId>("A");
  const [matchday, setMatchday] = useState<Matchday>(1);

  const groupMatches = matches.filter(
    (m) => m.group === group && m.matchday === matchday
  );

  return (
    <section className="rounded-2xl border border-line bg-panel shadow-plate p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Enter match results
          </h2>
          <p className="mt-1 text-sm text-muted">
            Pick a group and matchday, then fill in scores and cards as games
            are played. Everything updates the Wooden Spoon table live and is
            saved in this browser.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Reset all entered results back to blank fixtures?")) {
              resetAll();
            }
          }}
          className="self-start rounded-lg border border-line px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted hover:text-alert hover:border-alert/40"
        >
          Reset all results
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Group</span>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as GroupId)}
            className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm"
          >
            {GROUP_IDS.map((g) => (
              <option key={g} value={g}>
                {g} — {teamsByGroup(g).map((t) => t.id).join(" / ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Matchday</span>
          <select
            value={matchday}
            onChange={(e) => setMatchday(Number(e.target.value) as Matchday)}
            className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm"
          >
            {[1, 2, 3].map((md) => (
              <option key={md} value={md}>
                Matchday {md}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {groupMatches.map((m) => (
          <MatchRow key={m.id} match={m} onSave={updateMatch} />
        ))}
      </div>
    </section>
  );
}
