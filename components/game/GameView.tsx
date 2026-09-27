"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/lib/game";
import { createHumanPlayer, type Players } from "@/lib/players";
import { Board, PromotionPicker } from "@/components/board";
import { GameControls } from "./GameControls";
import { MoveList } from "./MoveList";
import { StatusPanel } from "./StatusPanel";

export interface GameViewProps {
  /** Defaults to two local human players. Bots plug in here later. */
  players?: Players;
}

export function GameView({ players: playersProp }: GameViewProps) {
  const players = useMemo<Players>(
    () =>
      playersProp ?? { w: createHumanPlayer("w"), b: createHumanPlayer("b") },
    [playersProp],
  );
  const game = useGame({ players });
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:grid-cols-[minmax(0,1fr)_20rem] md:p-8">
      <div className="relative">
        <Board
          position={game.position}
          flipped={flipped}
          selected={game.selected}
          targets={game.selectedTargets}
          lastMove={game.lastMove}
          interactive={game.humanToMove && game.pendingPromotion === null}
          onSquareClick={game.selectSquare}
        />
        {game.pendingPromotion && (
          <PromotionPicker
            color={game.position.turn}
            onChoose={game.choosePromotion}
            onCancel={game.cancelPromotion}
          />
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <StatusPanel
          position={game.position}
          status={game.status}
          players={players}
          captureForced={game.captureForced}
          error={game.error}
        />
        <GameControls
          canUndo={game.canUndo}
          flipped={flipped}
          onNewGame={() => game.reset()}
          onUndo={game.undo}
          onFlip={() => setFlipped((f) => !f)}
        />
        <MoveList moves={game.session.moves} />
      </aside>
    </div>
  );
}
