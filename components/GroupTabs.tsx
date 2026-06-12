import { GROUP_IDS } from "../lib/teams";

export function GroupTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (group: string) => void;
}) {
  const options = ["ALL", ...GROUP_IDS];

  return (
    <div
      role="tablist"
      aria-label="Filter standings by group"
      className="flex flex-wrap gap-1.5"
    >
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
              isActive
                ? "bg-spoon text-ink"
                : "bg-panel text-muted hover:text-paper border border-line"
            }`}
          >
            {opt === "ALL" ? "All teams" : `Group ${opt}`}
          </button>
        );
      })}
    </div>
  );
}
