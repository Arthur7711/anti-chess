import { describe, expect, it } from "vitest";
import { parseSquare } from "@/lib/engine";
import { createSession, currentPosition, playMove, undoMoves } from "./session";

const sq = parseSquare;

describe("game session", () => {
  it("records moves and positions consistently", () => {
    let s = createSession();
    s = playMove(s, { from: sq("e2"), to: sq("e3") });
    s = playMove(s, { from: sq("b7"), to: sq("b5") });
    expect(s.moves).toHaveLength(2);
    expect(s.positions).toHaveLength(3);
    expect(currentPosition(s).turn).toBe("w");
    expect(s.status).toEqual({ kind: "playing" });
  });

  it("undoes moves", () => {
    let s = createSession();
    s = playMove(s, { from: sq("e2"), to: sq("e3") });
    s = playMove(s, { from: sq("b7"), to: sq("b5") });
    s = undoMoves(s);
    expect(s.moves).toHaveLength(1);
    expect(currentPosition(s).turn).toBe("b");
    expect(undoMoves(createSession())).toEqual(createSession());
  });

  it("detects threefold repetition across the game", () => {
    // Two lone kings shuffling back and forth.
    let s = createSession("8/8/8/8/8/8/8/K6k w - - 0 1");
    const shuffle: Array<[string, string]> = [
      ["a1", "a2"],
      ["h1", "h2"],
      ["a2", "a1"],
      ["h2", "h1"], // start position, 2nd occurrence
      ["a1", "a2"],
      ["h1", "h2"],
      ["a2", "a1"],
      ["h2", "h1"], // 3rd occurrence
    ];
    for (const [from, to] of shuffle) {
      s = playMove(s, { from: sq(from), to: sq(to) });
    }
    expect(s.status).toEqual({ kind: "draw", reason: "threefold-repetition" });
    expect(() => playMove(s, { from: sq("a1"), to: sq("a2") })).toThrow();
  });

  it("ends when a side runs out of pieces", () => {
    // Black rook on b1 next to the white king: White must capture it, leaving
    // Black with no pieces, so Black wins.
    let s = createSession("8/8/8/8/8/8/8/Kr6 w - - 0 1");
    s = playMove(s, { from: sq("a1"), to: sq("b1") });
    expect(s.status).toEqual({ kind: "won", winner: "b", reason: "no-pieces" });
  });
});
