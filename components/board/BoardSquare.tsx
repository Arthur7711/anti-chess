import { fileOf, rankOf, squareName, type Piece, type Square } from "@/lib/engine";
import { PieceGlyph } from "./PieceGlyph";

export interface BoardSquareProps {
  square: Square;
  piece: Piece | null;
  selected: boolean;
  target: boolean;
  lastMove: boolean;
  interactive: boolean;
  showFile: boolean;
  showRank: boolean;
  onClick: (square: Square) => void;
}

export function BoardSquare({
  square,
  piece,
  selected,
  target,
  lastMove,
  interactive,
  showFile,
  showRank,
  onClick,
}: BoardSquareProps) {
  const isLight = (fileOf(square) + rankOf(square)) % 2 === 1;
  const base = isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]";
  const highlight = selected
    ? "bg-[#f6f669]"
    : lastMove
      ? isLight
        ? "bg-[#cdd26a]"
        : "bg-[#aaa23a]"
      : base;
  const labelColor = isLight ? "text-[#b58863]" : "text-[#f0d9b5]";

  return (
    <button
      type="button"
      aria-label={`${squareName(square)}${piece ? "" : ", empty"}`}
      aria-pressed={selected}
      disabled={!interactive}
      onClick={() => onClick(square)}
      className={`relative flex aspect-square items-center justify-center ${highlight} ${
        interactive ? "cursor-pointer" : "cursor-default"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500`}
    >
      {target && !piece && (
        <span className="absolute h-[30%] w-[30%] rounded-full bg-black/25" />
      )}
      {target && piece && (
        <span className="absolute inset-0 rounded-full border-[0.4em] border-black/25" />
      )}
      {piece && (
        <PieceGlyph piece={piece} className="relative z-10 text-[2.4em]" />
      )}
      {showRank && (
        <span
          className={`absolute left-0.5 top-0 text-[0.55em] font-semibold ${labelColor}`}
        >
          {rankOf(square) + 1}
        </span>
      )}
      {showFile && (
        <span
          className={`absolute bottom-0 right-0.5 text-[0.55em] font-semibold ${labelColor}`}
        >
          {"abcdefgh"[fileOf(square)]}
        </span>
      )}
    </button>
  );
}
