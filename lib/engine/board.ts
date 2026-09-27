import type { Color, Piece, PieceType, Position, Square } from "./types";

export const FILES = "abcdefgh";
export const RANKS = "12345678";

export function square(file: number, rank: number): Square {
  return rank * 8 + file;
}

export function fileOf(sq: Square): number {
  return sq & 7;
}

export function rankOf(sq: Square): number {
  return sq >> 3;
}

export function isOnBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

export function squareName(sq: Square): string {
  return FILES[fileOf(sq)] + RANKS[rankOf(sq)];
}

export function parseSquare(name: string): Square {
  const file = FILES.indexOf(name[0]);
  const rank = RANKS.indexOf(name[1]);
  if (file < 0 || rank < 0 || name.length !== 2) {
    throw new Error(`Invalid square: ${name}`);
  }
  return square(file, rank);
}

export function opposite(color: Color): Color {
  return color === "w" ? "b" : "w";
}

export function piece(type: PieceType, color: Color): Piece {
  return { type, color };
}

export function pieceEquals(a: Piece | null, b: Piece | null): boolean {
  if (a === null || b === null) return a === b;
  return a.type === b.type && a.color === b.color;
}

export function emptyBoard(): Array<Piece | null> {
  return new Array<Piece | null>(64).fill(null);
}

export function piecesOf(position: Position, color: Color): Square[] {
  const result: Square[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = position.board[sq];
    if (p && p.color === color) result.push(sq);
  }
  return result;
}

export function countPieces(position: Position, color: Color): number {
  let n = 0;
  for (const p of position.board) if (p && p.color === color) n++;
  return n;
}
