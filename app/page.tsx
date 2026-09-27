import { GameView } from "@/components/game";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 md:px-8">
        <h1 className="text-xl font-bold tracking-tight">Antichess</h1>
        <p className="text-sm text-neutral-500">
          Lose all your pieces to win. Captures are compulsory. The king is an
          ordinary piece.
        </p>
      </header>
      <GameView />
    </main>
  );
}
