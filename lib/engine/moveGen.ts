import { fileOf, isOnBoard, rankOf, square } from "./board";
import type { Move, Piece, Position, PromotionPiece, Square } from "./types";

export const PROMOTION_PIECES: readonly PromotionPiece[] = [
  "q",
  "r",
  "b",
  "n",
  "k",
];

type Delta = readonly [number, number];

const KNIGHT_DELTAS: readonly Delta[] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const KING_DELTAS: readonly Delta[] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

const BISHOP_DIRS: readonly Delta[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const ROOK_DIRS: readonly Delta[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Whether a move captures something (including en passant). */
export function isCapture(position: Position, move: Move): boolean {
  if (position.board[move.to]) return true;
  const mover = position.board[move.from];
  return mover !== null && mover.type === "p" && position.epSquare === move.to;
}

function pushStepMoves(
  position: Position,
  from: Square,
  mover: Piece,
  deltas: readonly Delta[],
  out: Move[],
): void {
  const f = fileOf(from);
  const r = rankOf(from);
  for (const [df, dr] of deltas) {
    const nf = f + df;
    const nr = r + dr;
    if (!isOnBoard(nf, nr)) continue;
    const to = square(nf, nr);
    const target = position.board[to];
    if (target === null || target.color !== mover.color) {
      out.push({ from, to });
    }
  }
}

function pushSlidingMoves(
  position: Position,
  from: Square,
  mover: Piece,
  dirs: readonly Delta[],
  out: Move[],
): void {
  const f = fileOf(from);
  const r = rankOf(from);
  for (const [df, dr] of dirs) {
    let nf = f + df;
    let nr = r + dr;
    while (isOnBoard(nf, nr)) {
      const to = square(nf, nr);
      const target = position.board[to];
      if (target === null) {
        out.push({ from, to });
      } else {
        if (target.color !== mover.color) out.push({ from, to });
        break;
      }
      nf += df;
      nr += dr;
    }
  }
}

function pushPawnMoves(
  position: Position,
  from: Square,
  mover: Piece,
  out: Move[],
): void {
  const f = fileOf(from);
  const r = rankOf(from);
  const dir = mover.color === "w" ? 1 : -1;
  const startRank = mover.color === "w" ? 1 : 6;
  const promoRank = mover.color === "w" ? 7 : 0;

  const pushTarget = (to: Square) => {
    if (rankOf(to) === promoRank) {
      for (const promotion of PROMOTION_PIECES) {
        out.push({ from, to, promotion });
      }
    } else {
      out.push({ from, to });
    }
  };

  // Single and double push.
  const oneRank = r + dir;
  if (isOnBoard(f, oneRank)) {
    const oneSq = square(f, oneRank);
    if (position.board[oneSq] === null) {
      pushTarget(oneSq);
      if (r === startRank) {
        const twoSq = square(f, r + 2 * dir);
        if (position.board[twoSq] === null) out.push({ from, to: twoSq });
      }
    }
  }

  // Captures, including en passant.
  for (const df of [-1, 1]) {
    const nf = f + df;
    if (!isOnBoard(nf, oneRank)) continue;
    const to = square(nf, oneRank);
    const target = position.board[to];
    if (target !== null && target.color !== mover.color) {
      pushTarget(to);
    } else if (target === null && position.epSquare === to) {
      out.push({ from, to });
    }
  }
}

/**
 * All moves a piece can physically make from `from`, ignoring the
 * compulsory-capture rule. There is no check in antichess, so these are
 * otherwise fully legal.
 */
export function pseudoLegalMovesFrom(position: Position, from: Square): Move[] {
  const mover = position.board[from];
  if (!mover || mover.color !== position.turn) return [];
  const out: Move[] = [];
  switch (mover.type) {
    case "p":
      pushPawnMoves(position, from, mover, out);
      break;
    case "n":
      pushStepMoves(position, from, mover, KNIGHT_DELTAS, out);
      break;
    case "k":
      pushStepMoves(position, from, mover, KING_DELTAS, out);
      break;
    case "b":
      pushSlidingMoves(position, from, mover, BISHOP_DIRS, out);
      break;
    case "r":
      pushSlidingMoves(position, from, mover, ROOK_DIRS, out);
      break;
    case "q":
      pushSlidingMoves(position, from, mover, BISHOP_DIRS, out);
      pushSlidingMoves(position, from, mover, ROOK_DIRS, out);
      break;
  }
  return out;
}

export function pseudoLegalMoves(position: Position): Move[] {
  const out: Move[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = position.board[sq];
    if (p && p.color === position.turn) {
      out.push(...pseudoLegalMovesFrom(position, sq));
    }
  }
  return out;
}

/**
 * Legal antichess moves: if any capture is available, only captures are legal.
 */
export function legalMoves(position: Position): Move[] {
  const all = pseudoLegalMoves(position);
  const captures = all.filter((m) => isCapture(position, m));
  return captures.length > 0 ? captures : all;
}

/** Legal moves starting from a given square. */
export function legalMovesFrom(position: Position, from: Square): Move[] {
  return legalMoves(position).filter((m) => m.from === from);
}

/** True when the side to move is forced to capture this turn. */
export function mustCapture(position: Position): boolean {
  return pseudoLegalMoves(position).some((m) => isCapture(position, m));
}

export function findLegalMove(
  position: Position,
  from: Square,
  to: Square,
  promotion?: PromotionPiece,
): Move | undefined {
  return legalMoves(position).find(
    (m) => m.from === from && m.to === to && m.promotion === promotion,
  );
}
