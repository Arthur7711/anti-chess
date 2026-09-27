# Antichess

A two-player antichess (losing chess) game built with Next.js.

## Rules implemented

- Capturing is compulsory. If several captures are available, any may be chosen.
- The king is an ordinary piece: no check, no checkmate, no castling.
- Pawns may promote to queen, rook, bishop, knight, or king.
- En passant exists and counts as a compulsory capture.
- A player wins by losing all their pieces, or by having no legal move (stalemate wins).
- Draws: fifty-move rule and threefold repetition.

## Getting started

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # engine and session tests
```

## Architecture

The code is split into layers that only depend downward. The engine has no
React or DOM dependency, so it can run in tests, web workers, or on the server.

```
lib/engine/       Pure rules: types, board helpers, FEN, move generation,
                  move application, game-over detection, notation.
lib/players/      Player abstraction. `HumanPlayer` moves come from the UI;
                  `BotPlayer` implements `chooseMove(request, signal)`.
lib/game/         Game session (pure history + status) and the `useGame`
                  React hook that owns selection, promotion prompts, undo,
                  and drives bot players when it is their turn.
components/board/ Board rendering: squares, piece glyphs, promotion picker.
components/game/  Game screen: status, controls, move list, `GameView`.
app/              Next.js routes. `app/page.tsx` renders `GameView`.
```

### Adding a bot

Implement the `BotPlayer` interface from `lib/players` and pass it to
`GameView` (or `useGame`) as one of the two players:

```ts
const bot: BotPlayer = {
  kind: "bot",
  id: "random",
  name: "Random bot",
  color: "b",
  async chooseMove({ legalMoves }) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  },
};

<GameView players={{ w: createHumanPlayer("w"), b: bot }} />
```

The hook calls `chooseMove` whenever it is the bot's turn and applies the
returned move. The `AbortSignal` is triggered if the game is reset or undone
while the bot is thinking. Everything a bot needs is in `lib/engine`:
`legalMoves`, `applyMove`, `evaluateStatus`, `toFen`, and friends.
