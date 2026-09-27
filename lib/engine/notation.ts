import { squareName } from "./board";
import type { MoveDetail, PieceType } from "./types";

const PIECE_LETTERS: Record<PieceType, string> = {
  p: "",
  n: "N",
  b: "B",
  r: "R",
  q: "Q",
  k: "K",
};

/**
 * Long algebraic notation, unambiguous without needing the position:
 *   e2-e4, Nb1-c3, Bf1xb5, e5xd6 e.p., b7xa8=K
 */
export function moveToNotation(detail: MoveDetail): string {
  const piece = PIECE_LETTERS[detail.piece.type];
  const sep = detail.captured ? "x" : "-";
  let text = `${piece}${squareName(detail.from)}${sep}${squareName(detail.to)}`;
  if (detail.promotion) text += `=${detail.promotion.toUpperCase()}`;
  if (detail.enPassant) text += " e.p.";
  return text;
}
