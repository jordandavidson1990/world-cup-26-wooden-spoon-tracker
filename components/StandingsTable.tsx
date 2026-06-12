import { TeamStats } from "../lib/types";

function gdLabel(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

export function StandingsTable({
  stats,
  worstTeamId,
  showGroupColumn = true,
}: {
  stats: TeamStats[];
  worstTeamId?: string;
  showGroupColumn?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel shadow-plate">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-muted">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Team</th>
            {showGroupColumn && <th className="px-3 py-3 font-medium">Grp</th>}
            <th className="px-3 py-3 font-medium text-right">P</th>
            <th className="px-3 py-3 font-medium text-right">W</th>
            <th className="px-3 py-3 font-medium text-right">D</th>
            <th className="px-3 py-3 font-medium text-right">L</th>
            <th className="px-3 py-3 font-medium text-right">GF</th>
            <th className="px-3 py-3 font-medium text-right">GA</th>
            <th className="px-3 py-3 font-medium text-right">GD</th>
            <th className="px-3 py-3 font-medium text-right">Pts</th>
            <th className="px-3 py-3 font-medium text-right">🟨</th>
            <th className="px-3 py-3 font-medium text-right">🟥</th>
            <th className="px-3 py-3 font-medium text-right">Disc</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, idx) => {
            const isWorst = s.team.id === worstTeamId;
            return (
              <tr
                key={s.team.id}
                className={`border-b border-line/60 last:border-b-0 ${
                  isWorst ? "bg-spoon/15" : idx % 2 === 1 ? "bg-white/[0.015]" : ""
                }`}
              >
                <td className="px-4 py-2.5 tabular-nums text-muted">
                  {idx + 1}
                </td>
                <td className="px-4 py-2.5 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>{s.team.flag ?? "🏳️"}</span>
                    <span>{s.team.name}</span>
                    {isWorst && (
                      <span
                        className="ml-1 inline-flex items-center rounded-full bg-spoon/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-spoonlight"
                        title="Last overall on points, goal difference and discipline"
                      >
                        🥄 Spoon
                      </span>
                    )}
                  </span>
                </td>
                {showGroupColumn && (
                  <td className="px-3 py-2.5 text-muted">{s.team.group}</td>
                )}
                <td className="px-3 py-2.5 text-right tabular-nums">{s.played}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.won}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.drawn}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.lost}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.goalsFor}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.goalsAgainst}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{gdLabel(s.goalDifference)}</td>
                <td className="px-3 py-2.5 text-right font-display font-semibold tabular-nums">
                  {s.points}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.yellowCards}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{s.redCards}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-alert">
                  {s.disciplinaryPoints}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
