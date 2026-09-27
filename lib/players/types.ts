import type { Color, Move, Position } from "@/lib/engine";

export type PlayerKind = "human" | "bot";

/**
 * Everything a move provider needs to know to pick a move. Kept minimal so
 * bots can be implemented against the engine alone.
 */
export interface MoveRequest {
  readonly position: Position;
  readonly legalMoves: readonly Move[];
  /** Positions so far, oldest first, for bots that care about repetition. */
  readonly history: readonly Position[];
}

interface PlayerBase {
  readonly id: string;
  readonly name: string;
  readonly color: Color;
}

/** A human at the keyboard. Moves arrive via the UI, not via chooseMove. */
export interface HumanPlayer extends PlayerBase {
  readonly kind: "human";
}

/**
 * An automated player. The game session calls chooseMove when it is this
 * player's turn and applies the returned move. The signal is aborted when the
 * game is reset or undone while the bot is thinking.
 */
export interface BotPlayer extends PlayerBase {
  readonly kind: "bot";
  chooseMove(request: MoveRequest, signal: AbortSignal): Promise<Move>;
}

export type Player = HumanPlayer | BotPlayer;

export type Players = Readonly<Record<Color, Player>>;
