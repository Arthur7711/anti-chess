export interface GameControlsProps {
  canUndo: boolean;
  flipped: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
}

const buttonClass =
  "rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800";

export function GameControls({
  canUndo,
  flipped,
  onNewGame,
  onUndo,
  onFlip,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={buttonClass} onClick={onNewGame}>
        New game
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onUndo}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onFlip}
        aria-pressed={flipped}
      >
        Flip board
      </button>
    </div>
  );
}
