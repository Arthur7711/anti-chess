import { describe, expect, it } from "vitest";
import {
  applyMove,
  evaluateStatus,
  legalMoves,
  makeMove,
  mustCapture,
  parseFen,
  parseSquare,
  positionKey,
  START_FEN,
  toFen,
  IllegalMoveError,
  type Position,
} from "./index";

function perft(position: Position, depth: number): number {
  if (depth === 0) return 1;
  let nodes = 0;
  for (const move of legalMoves(position)) {
    nodes += perft(applyMove(position, move).position, depth - 1);
  }
  return nodes;
}

const sq = parseSquare;

describe("FEN", () => {
  it("round-trips the start position", () => {
    expect(toFen(parseFen(START_FEN))).toBe(START_FEN);
  });

  it("round-trips a position with an en passant square", () => {
    const fen = "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b - d6 0 3";
    expect(toFen(parseFen(fen))).toBe(fen);
  });

  it("position keys ignore move clocks", () => {
    const a = parseFen("8/8/8/8/8/8/8/K7 w - - 0 1");
    const b = parseFen("8/8/8/8/8/8/8/K7 w - - 40 99");
    expect(positionKey(a)).toBe(positionKey(b));
  });
});

describe("move generation", () => {
  it("matches known antichess perft counts from the start position", () => {
    const start = parseFen(START_FEN);
    expect(perft(start, 1)).toBe(20);
    expect(perft(start, 2)).toBe(400);
    expect(perft(start, 3)).toBe(8067);
    expect(perft(start, 4)).toBe(153299);
  });

  it("forces captures when one is available", () => {
    // After 1.e3 b5 the bishop on f1 can take b5; that is the only legal move.
    const pos = parseFen(
      "rnbqkbnr/p1pppppp/8/1p6/8/4P3/PPPP1PPP/RNBQKBNR w - - 0 2",
    );
    expect(mustCapture(pos)).toBe(true);
    const moves = legalMoves(pos);
    expect(moves).toHaveLength(1);
    expect(moves[0]).toEqual({ from: sq("f1"), to: sq("b5") });
  });

  it("treats en passant as a compulsory capture", () => {
    const pos = parseFen("8/8/8/3pP3/8/8/8/8 w - d6 0 1");
    const moves = legalMoves(pos);
    expect(moves).toEqual([{ from: sq("e5"), to: sq("d6") }]);
    const { position, detail } = applyMove(pos, moves[0]);
    expect(detail.enPassant).toBe(true);
    expect(detail.captured).toEqual({ type: "p", color: "b" });
    expect(position.board[sq("d5")]).toBeNull();
  });

  it("offers five promotion pieces including king", () => {
    const pos = parseFen("8/P7/8/8/8/8/8/8 w - - 0 1");
    const promos = legalMoves(pos).map((m) => m.promotion).sort();
    expect(promos).toEqual(["b", "k", "n", "q", "r"]);
    const { position } = applyMove(pos, {
      from: sq("a7"),
      to: sq("a8"),
      promotion: "k",
    });
    expect(position.board[sq("a8")]).toEqual({ type: "k", color: "w" });
  });

  it("lets the king be captured like any other piece", () => {
    const pos = parseFen("8/8/8/8/8/8/3k4/3R4 w - - 0 1");
    const moves = legalMoves(pos);
    expect(moves).toEqual([{ from: sq("d1"), to: sq("d2") }]);
  });

  it("has no castling moves", () => {
    const pos = parseFen("4k3/8/8/8/8/8/8/R3K2R w - - 0 1");
    const kingMoves = legalMoves(pos).filter((m) => m.from === sq("e1"));
    expect(kingMoves.map((m) => m.to).sort()).toEqual(
      [sq("d1"), sq("d2"), sq("e2"), sq("f1"), sq("f2")].sort(),
    );
  });
});

describe("makeMove", () => {
  it("rejects a quiet move when a capture is available", () => {
    const pos = parseFen(
      "rnbqkbnr/p1pppppp/8/1p6/8/4P3/PPPP1PPP/RNBQKBNR w - - 0 2",
    );
    expect(() => makeMove(pos, { from: sq("a2"), to: sq("a3") })).toThrow(
      IllegalMoveError,
    );
  });

  it("updates clocks and en passant square", () => {
    const start = parseFen(START_FEN);
    const { position } = makeMove(start, { from: sq("e2"), to: sq("e4") });
    expect(position.epSquare).toBe(sq("e3"));
    expect(position.halfmoveClock).toBe(0);
    expect(position.turn).toBe("b");
    const { position: after } = makeMove(position, {
      from: sq("g8"),
      to: sq("f6"),
    });
    expect(after.epSquare).toBeNull();
    expect(after.halfmoveClock).toBe(1);
    expect(after.fullmoveNumber).toBe(2);
  });
});

describe("game status", () => {
  it("is playing at the start", () => {
    expect(evaluateStatus(parseFen(START_FEN))).toEqual({ kind: "playing" });
  });

  it("awards the win to the side with no pieces", () => {
    const pos = parseFen("8/8/8/8/8/8/8/K7 b - - 0 1");
    expect(evaluateStatus(pos)).toEqual({
      kind: "won",
      winner: "b",
      reason: "no-pieces",
    });
  });

  it("awards the win to the stalemated side", () => {
    // Black pawn on a2 blocked by a white piece on a1; Black has no move.
    const pos = parseFen("8/8/8/8/8/8/p7/R7 b - - 0 1");
    expect(evaluateStatus(pos)).toEqual({
      kind: "won",
      winner: "b",
      reason: "stalemate",
    });
  });

  it("detects the fifty-move rule", () => {
    const pos = parseFen("8/8/8/8/8/8/8/K6k w - - 100 60");
    expect(evaluateStatus(pos)).toEqual({ kind: "draw", reason: "fifty-move" });
  });

  it("detects threefold repetition via occurrences", () => {
    const pos = parseFen("8/8/8/8/8/8/8/K6k w - - 4 3");
    expect(evaluateStatus(pos, 3)).toEqual({
      kind: "draw",
      reason: "threefold-repetition",
    });
    expect(evaluateStatus(pos, 2)).toEqual({ kind: "playing" });
  });
});
