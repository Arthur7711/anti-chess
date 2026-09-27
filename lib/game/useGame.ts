"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  findLegalMove,
  legalMoves,
  legalMovesFrom,
  mustCapture,
  START_FEN,
  type Move,
  type PromotionPiece,
  type Square,
} from "@/lib/engine";
import type { Player, Players } from "@/lib/players";
import {
  createSession,
  currentPosition,
  playMove,
  undoMoves,
  type GameSession,
} from "./session";

interface State {
  readonly session: GameSession;
  readonly selected: Square | null;
  /** Set while the UI is asking which piece to promote to. */
  readonly pendingPromotion: { from: Square; to: Square } | null;
  readonly error: string | null;
}

type Action =
  | { type: "select"; square: Square | null }
  | { type: "play"; move: Move }
  | { type: "requestPromotion"; from: Square; to: Square }
  | { type: "cancelPromotion" }
  | { type: "undo" }
  | { type: "reset"; fen?: string }
  | { type: "error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.square, error: null };
    case "play":
      try {
        return {
          session: playMove(state.session, action.move),
          selected: null,
          pendingPromotion: null,
          error: null,
        };
      } catch (e) {
        return {
          ...state,
          selected: null,
          pendingPromotion: null,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    case "requestPromotion":
      return {
        ...state,
        pendingPromotion: { from: action.from, to: action.to },
        error: null,
      };
    case "cancelPromotion":
      return { ...state, pendingPromotion: null, selected: null };
    case "undo":
      return {
        session: undoMoves(state.session),
        selected: null,
        pendingPromotion: null,
        error: null,
      };
    case "reset":
      return {
        session: createSession(action.fen),
        selected: null,
        pendingPromotion: null,
        error: null,
      };
    case "error":
      return { ...state, error: action.message };
  }
}

export interface UseGameOptions {
  players: Players;
  initialFen?: string;
}

/**
 * Game controller hook. Owns the session, square selection, promotion
 * prompts, and drives bot players when it is their turn.
 */
export function useGame({ players, initialFen = START_FEN }: UseGameOptions) {
  const [state, dispatch] = useReducer(reducer, initialFen, (fen) => ({
    session: createSession(fen),
    selected: null,
    pendingPromotion: null,
    error: null,
  }));

  const { session, selected, pendingPromotion, error } = state;
  const position = currentPosition(session);
  const isPlaying = session.status.kind === "playing";
  const currentPlayer: Player = players[position.turn];
  const humanToMove = isPlaying && currentPlayer.kind === "human";

  const allLegalMoves = useMemo(() => legalMoves(position), [position]);
  const captureForced = useMemo(() => mustCapture(position), [position]);
  const selectedTargets = useMemo(
    () =>
      selected === null
        ? []
        : Array.from(
            new Set(legalMovesFrom(position, selected).map((m) => m.to)),
          ),
    [position, selected],
  );
  const lastMove = session.moves[session.moves.length - 1] ?? null;

  // Drive bot players. Aborted if the position changes underneath them.
  const botRunRef = useRef(0);
  useEffect(() => {
    if (!isPlaying || currentPlayer.kind !== "bot") return;
    const controller = new AbortController();
    const runId = ++botRunRef.current;
    currentPlayer
      .chooseMove(
        { position, legalMoves: allLegalMoves, history: session.positions },
        controller.signal,
      )
      .then((move) => {
        if (controller.signal.aborted || botRunRef.current !== runId) return;
        dispatch({ type: "play", move });
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        dispatch({
          type: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      });
    return () => controller.abort();
  }, [isPlaying, currentPlayer, position, allLegalMoves, session.positions]);

  const selectSquare = useCallback(
    (square: Square) => {
      if (!humanToMove || pendingPromotion) return;
      // Only pieces that actually have a legal move can be selected. When a
      // capture is forced this excludes every piece that cannot capture.
      const selectable = legalMovesFrom(position, square).length > 0;

      if (selected === null) {
        if (selectable) dispatch({ type: "select", square });
        return;
      }

      if (square === selected) {
        dispatch({ type: "select", square: null });
        return;
      }

      const candidates = legalMovesFrom(position, selected).filter(
        (m) => m.to === square,
      );
      if (candidates.length === 0) {
        // Switch selection to another movable piece, or clear it.
        dispatch({ type: "select", square: selectable ? square : null });
        return;
      }
      if (candidates.length > 1) {
        dispatch({ type: "requestPromotion", from: selected, to: square });
        return;
      }
      dispatch({ type: "play", move: candidates[0] });
    },
    [humanToMove, pendingPromotion, position, selected],
  );

  const choosePromotion = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) return;
      const move = findLegalMove(
        position,
        pendingPromotion.from,
        pendingPromotion.to,
        promotion,
      );
      if (move) dispatch({ type: "play", move });
      else dispatch({ type: "cancelPromotion" });
    },
    [pendingPromotion, position],
  );

  const cancelPromotion = useCallback(
    () => dispatch({ type: "cancelPromotion" }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const reset = useCallback(
    (fen?: string) => dispatch({ type: "reset", fen }),
    [],
  );

  return {
    session,
    position,
    status: session.status,
    players,
    currentPlayer,
    humanToMove,
    captureForced,
    selected,
    selectedTargets,
    pendingPromotion,
    lastMove,
    error,
    canUndo: session.moves.length > 0,
    selectSquare,
    choosePromotion,
    cancelPromotion,
    undo,
    reset,
  };
}

export type GameController = ReturnType<typeof useGame>;
