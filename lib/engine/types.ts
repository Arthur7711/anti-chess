/**
 * Core domain types for the antichess engine.
 *
 * The engine is framework-agnostic: no React, no DOM. Everything here is plain
 * data so positions can be serialised, diffed, and later fed to bots.
 */

export type Color = "w" | "b";

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface Piece {
  readonly type: PieceType;
  readonly color: Color;
}

/**
 * Square index 0..63 using little-endian rank-file mapping:
 * a1 = 0, b1 = 1, ... h1 = 7, a2 = 8, ... h8 = 63.
 */
export type Square = number;

/** Pieces a pawn may promote to. Antichess allows promotion to a king. */
export type PromotionPiece = Exclude<PieceType, "p">;

export interface Move {
  readonly from: Square;
  readonly to: Square;
  readonly promotion?: PromotionPiece;
}

/** A move enriched with what happened, for notation and UI. */
export interface MoveDetail extends Move {
  readonly piece: Piece;
  readonly captured: Piece | null;
  readonly enPassant: boolean;
}

/** Immutable snapshot of a position. */
export interface Position {
  /** 64 entries indexed by Square. */
  readonly board: ReadonlyArray<Piece | null>;
  readonly turn: Color;
  /** Square a pawn may capture onto via en passant, if any. */
  readonly epSquare: Square | null;
  /** Half-moves since last capture or pawn move (fifty-move rule). */
  readonly halfmoveClock: number;
  /** Starts at 1 and increments after Black moves. */
  readonly fullmoveNumber: number;
}

export type WinReason = "no-pieces" | "stalemate";
export type DrawReason = "fifty-move" | "threefold-repetition";

export type GameStatus =
  | { readonly kind: "playing" }
  | { readonly kind: "won"; readonly winner: Color; readonly reason: WinReason }
  | { readonly kind: "draw"; readonly reason: DrawReason };
