import { countPieces, type Color, type GameStatus, type Position } from "@/lib/engine";
import type { Players } from "@/lib/players";

export interface StatusPanelProps {
  position: Position;
  status: GameStatus;
  players: Players;
  captureForced: boolean;
  error: string | null;
}

function colorName(color: Color): string {
  return color === "w" ? "White" : "Black";
}

function describeStatus(status: GameStatus, players: Players): string {
  switch (status.kind) {
    case "playing":
      return "";
    case "won": {
      const name = players[status.winner].name;
      return status.reason === "no-pieces"
        ? `${name} wins by losing all pieces`
        : `${name} wins by stalemate`;
    }
    case "draw":
      return status.reason === "fifty-move"
        ? "Draw by the fifty-move rule"
        : "Draw by threefold repetition";
  }
}

export function StatusPanel({
  position,
  status,
  players,
  captureForced,
  error,
}: StatusPanelProps) {
  const toMove = players[position.turn];
  const finished = status.kind !== "playing";

  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between gap-4">
        <PieceCount color="w" name={players.w.name} count={countPieces(position, "w")} />
        <PieceCount color="b" name={players.b.name} count={countPieces(position, "b")} />
      </div>

      {finished ? (
        <p className="text-lg font-semibold">{describeStatus(status, players)}</p>
      ) : (
        <p className="text-base">
          <span className="font-semibold">{toMove.name}</span>
          {toMove.name !== colorName(position.turn) &&
            ` (${colorName(position.turn)})`}{" "}
          to move
          {captureForced && (
            <span className="ml-2 rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900">
              must capture
            </span>
          )}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}

function PieceCount({ color, name, count }: { color: Color; name: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className={`inline-block h-3 w-3 rounded-full ring-1 ring-black/40 ${
          color === "w" ? "bg-white" : "bg-neutral-900"
        }`}
      />
      <span className="font-medium">{name}</span>
      <span className="text-neutral-500">
        {count} {count === 1 ? "piece" : "pieces"}
      </span>
    </div>
  );
}
