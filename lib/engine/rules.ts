import { countPieces, opposite, rankOf } from "./board";
import { isCapture, legalMoves } from "./moveGen";
import type { GameStatus, Move, MoveDetail, Piece, Position } from "./types";

/** Half-move count at which the fifty-move rule triggers. */
export const FIFTY_MOVE_HALFMOVES = 100;

export class IllegalMoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalMoveError";
  }
}

function sameMove(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to && a.promotion === b.promotion;
}

/**
 * Apply a move that is assumed to be legal. Returns the resulting position
 * and a detailed description of the move. Does not mutate the input.
 */
export function applyMove(
  position: Position,
  move: Move,
): { position: Position; detail: MoveDetail } {
  const mover = position.board[move.from];
  if (!mover) throw new IllegalMoveError("No piece on the source square");
  if (mover.color !== position.turn) {
    throw new IllegalMoveError("That piece belongs to the other side");
  }

  const board = position.board.slice();
  const enPassant =
    mover.type === "p" &&
    position.epSquare === move.to &&
    board[move.to] === null;

  let captured: Piece | null = board[move.to];
  if (enPassant) {
    const capturedSq = mover.color === "w" ? move.to - 8 : move.to + 8;
    captured = board[capturedSq];
    board[capturedSq] = null;
  }

  board[move.from] = null;
  board[move.to] = move.promotion
    ? { type: move.promotion, color: mover.color }
    : mover;

  let epSquare: number | null = null;
  if (
    mover.type === "p" &&
    Math.abs(rankOf(move.to) - rankOf(move.from)) === 2
  ) {
    epSquare = (move.from + move.to) / 2;
  }

  const resetsClock = mover.type === "p" || captured !== null;

  const next: Position = {
    board,
    turn: opposite(position.turn),
    epSquare,
    halfmoveClock: resetsClock ? 0 : position.halfmoveClock + 1,
    fullmoveNumber:
      position.turn === "b"
        ? position.fullmoveNumber + 1
        : position.fullmoveNumber,
  };

  return {
    position: next,
    detail: { ...move, piece: mover, captured, enPassant },
  };
}

/** Validate a move against the legal move list, then apply it. */
export function makeMove(
  position: Position,
  move: Move,
): { position: Position; detail: MoveDetail } {
  const legal = legalMoves(position);
  if (!legal.some((m) => sameMove(m, move))) {
    const forced = legal.some((m) => isCapture(position, m));
    throw new IllegalMoveError(
      forced ? "A capture is available and must be taken" : "Illegal move",
    );
  }
  return applyMove(position, move);
}

/**
 * Evaluate the status of a position. `occurrences` is how many times this
 * position has appeared in the game so far, including now, for the
 * threefold-repetition rule.
 *
 * Antichess win conditions, checked for the side to move:
 *  1. No pieces left: that side wins.
 *  2. No legal moves (stalemate): that side wins.
 * Then the standard draw conditions.
 */
export function evaluateStatus(
  position: Position,
  occurrences = 1,
): GameStatus {
  const side = position.turn;

  if (countPieces(position, side) === 0) {
    return { kind: "won", winner: side, reason: "no-pieces" };
  }
  if (legalMoves(position).length === 0) {
    return { kind: "won", winner: side, reason: "stalemate" };
  }
  if (occurrences >= 3) {
    return { kind: "draw", reason: "threefold-repetition" };
  }
  if (position.halfmoveClock >= FIFTY_MOVE_HALFMOVES) {
    return { kind: "draw", reason: "fifty-move" };
  }
  return { kind: "playing" };
}
