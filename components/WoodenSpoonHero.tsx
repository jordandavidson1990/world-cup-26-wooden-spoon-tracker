import { TeamStats } from "../lib/types";

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl sm:text-4xl font-display font-semibold tabular-nums leading-none">
        {value}
      </span>
      <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
    </div>
  );
}

export function WoodenSpoonHero({
  worst,
  playedCount,
  totalMatches,
}: {
  worst: TeamStats | null;
  playedCount: number;
  totalMatches: number;
}) {
  if (!worst || playedCount === 0) {
    return (
      <section className="rounded-2xl border border-line bg-panel bg-scoreboard shadow-plate px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.25em] text-spoonlight">
          Wooden Spoon Watch
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
          No results logged yet
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Enter scores and cards for the group-stage fixtures below to see
          which of the 48 teams is currently sitting last — on points, goal
          difference and disciplinary record.
        </p>
      </section>
    );
  }

  const { team, points, goalDifference, played, disciplinaryPoints, yellowCards, redCards } =
    worst;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-panel bg-scoreboard shadow-plate px-6 py-10 sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 text-[12rem] opacity-[0.06] spoon-wobble select-none"
      >
        🥄
      </div>

      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-spoonlight">
            Wooden Spoon Watch · {playedCount}/{totalMatches} group matches played
          </p>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-5xl sm:text-6xl leading-none" aria-hidden>
              {team.flag ?? "🏳️"}
            </span>
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
                {team.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                Currently last overall · Group {team.group}
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-sm text-muted">
            Ranked last among all 48 teams by points first, then goal
            difference, then disciplinary record — the criteria for this
            tournament&rsquo;s informal Wooden Spoon.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-6 sm:flex sm:gap-10 sm:text-right">
          <StatBlock label="Played" value={String(played)} />
          <StatBlock label="Points" value={String(points)} />
          <StatBlock
            label="Goal diff"
            value={goalDifference > 0 ? `+${goalDifference}` : String(goalDifference)}
          />
          <StatBlock
            label="Cards"
            value={`${yellowCards}🟨 ${redCards}🟥`}
          />
          <StatBlock label="Disc. pts" value={String(disciplinaryPoints)} />
        </div>
      </div>
    </section>
  );
}
