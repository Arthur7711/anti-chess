import type { Piece, PieceType } from "@/lib/engine";

/**
 * Filled Unicode glyphs are used for both colours and tinted with CSS, since
 * the outlined "white" glyphs render inconsistently across fonts.
 */
const GLYPHS: Record<PieceType, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const NAMES: Record<PieceType, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export function pieceLabel(piece: Piece): string {
  return `${piece.color === "w" ? "white" : "black"} ${NAMES[piece.type]}`;
}

export function PieceGlyph({
  piece,
  className = "",
}: {
  piece: Piece;
  className?: string;
}) {
  const tint =
    piece.color === "w"
      ? "text-white [text-shadow:0_0_2px_#000,0_0_1px_#000,0_1px_1px_#000]"
      : "text-neutral-950 [text-shadow:0_0_1px_#fff8]";
  return (
    <span
      role="img"
      aria-label={pieceLabel(piece)}
      className={`select-none leading-none ${tint} ${className}`}
    >
      {GLYPHS[piece.type]}
    </span>
  );
}
