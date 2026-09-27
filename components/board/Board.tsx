"use client";

import { square, type Move, type Position, type Square } from "@/lib/engine";
import { BoardSquare } from "./BoardSquare";

export interface BoardProps {
  position: Position;
  /** When true, Black is at the bottom. */
  flipped?: boolean;
  selected?: Square | null;
  targets?: readonly Square[];
  lastMove?: Move | null;
  interactive?: boolean;
  onSquareClick?: (square: Square) => void;
}

export function Board({
  position,
  flipped = false,
  selected = null,
  targets = [],
  lastMove = null,
  interactive = true,
  onSquareClick = () => {},
}: BoardProps) {
  const ranks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const targetSet = new Set(targets);
  const bottomRank = ranks[7];
  const leftFile = files[0];

  return (
    <div
      role="grid"
      aria-label="Antichess board"
      className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-md text-[clamp(10px,2.2vw,18px)] shadow-lg ring-1 ring-black/20"
    >
      {ranks.map((rank) =>
        files.map((file) => {
          const sq = square(file, rank);
          return (
            <BoardSquare
              key={sq}
              square={sq}
              piece={position.board[sq]}
              selected={selected === sq}
              target={targetSet.has(sq)}
              lastMove={
                lastMove !== null && (lastMove.from === sq || lastMove.to === sq)
              }
              interactive={interactive}
              showFile={rank === bottomRank}
              showRank={file === leftFile}
              onClick={onSquareClick}
            />
          );
        }),
      )}
    </div>
  );
}
