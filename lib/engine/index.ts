/**
 * Public API of the antichess engine. UI, game session, and bots import from
 * here rather than from the internal modules.
 */
export * from "./types";
export {
  FILES,
  RANKS,
  square,
  fileOf,
  rankOf,
  squareName,
  parseSquare,
  opposite,
  piecesOf,
  countPieces,
} from "./board";
export { START_FEN, parseFen, toFen, positionKey } from "./fen";
export {
  PROMOTION_PIECES,
  isCapture,
  legalMoves,
  legalMovesFrom,
  mustCapture,
  findLegalMove,
} from "./moveGen";
export {
  FIFTY_MOVE_HALFMOVES,
  IllegalMoveError,
  applyMove,
  makeMove,
  evaluateStatus,
} from "./rules";
export { moveToNotation } from "./notation";
