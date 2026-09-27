import { emptyBoard, square } from "./board";
import type { Color, Piece, PieceType, Position } from "./types";

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

const PIECE_CHARS: Record<PieceType, string> = {
  p: "p",
  n: "n",
  b: "b",
  r: "r",
  q: "q",
  k: "k",
};

function pieceFromChar(ch: string): Piece {
  const lower = ch.toLowerCase();
  if (!"pnbrqk".includes(lower)) throw new Error(`Invalid FEN piece: ${ch}`);
  return { type: lower as PieceType, color: ch === lower ? "b" : "w" };
}

function pieceToChar(p: Piece): string {
  const ch = PIECE_CHARS[p.type];
  return p.color === "w" ? ch.toUpperCase() : ch;
}

/**
 * Parse a FEN string into a Position. The castling field is ignored because
 * antichess has no castling; it is accepted for compatibility with tools.
 */
export function parseFen(fen: string): Position {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 2) throw new Error(`Invalid FEN: ${fen}`);
  const [placement, turn, , ep = "-", halfmove = "0", fullmove = "1"] = parts;

  const board = emptyBoard();
  const rows = placement.split("/");
  if (rows.length !== 8) throw new Error(`Invalid FEN placement: ${placement}`);

  rows.forEach((row, i) => {
    const rank = 7 - i;
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        file += Number(ch);
      } else {
        if (file > 7) throw new Error(`Invalid FEN row: ${row}`);
        board[square(file, rank)] = pieceFromChar(ch);
        file++;
      }
    }
    if (file !== 8) throw new Error(`Invalid FEN row: ${row}`);
  });

  if (turn !== "w" && turn !== "b") throw new Error(`Invalid FEN turn: ${turn}`);

  let epSquare: number | null = null;
  if (ep !== "-") {
    const file = "abcdefgh".indexOf(ep[0]);
    const rank = "12345678".indexOf(ep[1]);
    if (file < 0 || rank < 0) throw new Error(`Invalid FEN ep square: ${ep}`);
    epSquare = square(file, rank);
  }

  return {
    board,
    turn: turn as Color,
    epSquare,
    halfmoveClock: Number(halfmove),
    fullmoveNumber: Number(fullmove),
  };
}

export function toFen(position: Position): string {
  const rows: string[] = [];
  for (let rank = 7; rank >= 0; rank--) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const p = position.board[square(file, rank)];
      if (p) {
        if (empty) {
          row += empty;
          empty = 0;
        }
        row += pieceToChar(p);
      } else {
        empty++;
      }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  const ep =
    position.epSquare === null
      ? "-"
      : "abcdefgh"[position.epSquare & 7] + "12345678"[position.epSquare >> 3];
  return `${rows.join("/")} ${position.turn} - ${ep} ${position.halfmoveClock} ${position.fullmoveNumber}`;
}

/**
 * Key identifying a position for repetition detection: placement, side to
 * move and en passant square. Clocks are excluded on purpose.
 */
export function positionKey(position: Position): string {
  return toFen(position).split(" ").slice(0, 4).join(" ");
}
