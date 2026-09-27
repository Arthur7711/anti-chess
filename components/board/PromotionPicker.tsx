"use client";

import { PROMOTION_PIECES, type Color, type PromotionPiece } from "@/lib/engine";
import { PieceGlyph } from "./PieceGlyph";

export interface PromotionPickerProps {
  color: Color;
  onChoose: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

export function PromotionPicker({ color, onChoose, onCancel }: PromotionPickerProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose promotion piece"
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">Promote to</p>
        <div className="flex gap-2">
          {PROMOTION_PIECES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChoose(type)}
              className="flex h-14 w-14 items-center justify-center rounded-md bg-[#f0d9b5] text-4xl hover:bg-[#f6f669] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <PieceGlyph piece={{ type, color }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-neutral-500 underline-offset-2 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
