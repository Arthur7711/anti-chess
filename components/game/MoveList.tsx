import { moveToNotation, type MoveDetail } from "@/lib/engine";

export interface MoveListProps {
  moves: readonly MoveDetail[];
}

export function MoveList({ moves }: MoveListProps) {
  const rows: Array<{ n: number; white?: MoveDetail; black?: MoveDetail }> = [];
  moves.forEach((m, i) => {
    if (i % 2 === 0) rows.push({ n: i / 2 + 1, white: m });
    else rows[rows.length - 1].black = m;
  });

  return (
    <section
      aria-label="Move list"
      className="flex max-h-72 flex-col overflow-y-auto rounded-lg border border-neutral-200 font-mono text-sm dark:border-neutral-800"
    >
      {rows.length === 0 ? (
        <p className="p-4 text-neutral-500">No moves yet</p>
      ) : (
        <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((row) => (
            <li key={row.n} className="grid grid-cols-[3ch_1fr_1fr] gap-2 px-3 py-1">
              <span className="text-neutral-500">{row.n}.</span>
              <span>{row.white ? moveToNotation(row.white) : ""}</span>
              <span>{row.black ? moveToNotation(row.black) : ""}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
