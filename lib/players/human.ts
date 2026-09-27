import type { Color } from "@/lib/engine";
import type { HumanPlayer } from "./types";

export function createHumanPlayer(color: Color, name?: string): HumanPlayer {
  return {
    kind: "human",
    id: `human-${color}`,
    color,
    name: name ?? (color === "w" ? "White" : "Black"),
  };
}
