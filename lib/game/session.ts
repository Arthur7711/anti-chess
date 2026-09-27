import {
  evaluateStatus,
  makeMove,
  parseFen,
  positionKey,
  START_FEN,
  type GameStatus,
  type Move,
  type MoveDetail,
  type Position,
} from "@/lib/engine";

/**
 * A complete game record. Pure data, updated through the pure functions
 * below; the React layer wraps this in a reducer.
 *
 * Invariant: positions.length === moves.length + 1 and positions[i] is the
 * position before moves[i].
 */
export interface GameSession {
  readonly positions: readonly Position[];
  readonly moves: readonly MoveDetail[];
  readonly status: GameStatus;
}

export function currentPosition(session: GameSession): Position {
  return session.positions[session.positions.length - 1];
}

function occurrencesOf(positions: readonly Position[], target: Position): number {
  const key = positionKey(target);
  let n = 0;
  for (const p of positions) if (positionKey(p) === key) n++;
  return n;
}

export function createSession(fen: string = START_FEN): GameSession {
  const start = parseFen(fen);
  return {
    positions: [start],
    moves: [],
    status: evaluateStatus(start),
  };
}

/**
 * Play a move. Throws IllegalMoveError for illegal moves and when the game is
 * already over.
 */
export function playMove(session: GameSession, move: Move): GameSession {
  if (session.status.kind !== "playing") {
    throw new Error("The game is over");
  }
  const { position, detail } = makeMove(currentPosition(session), move);
  const positions = [...session.positions, position];
  return {
    positions,
    moves: [...session.moves, detail],
    status: evaluateStatus(position, occurrencesOf(positions, position)),
  };
}

/** Take back the last `count` half-moves. */
export function undoMoves(session: GameSession, count = 1): GameSession {
  const n = Math.min(count, session.moves.length);
  if (n === 0) return session;
  const positions = session.positions.slice(0, -n);
  const last = positions[positions.length - 1];
  return {
    positions,
    moves: session.moves.slice(0, -n),
    status: evaluateStatus(last, occurrencesOf(positions, last)),
  };
}
