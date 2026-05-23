'use client';

import type { Game } from "@/lib/data";

// Stub — full implementation in Step 6
export default function GameCard({ game }: { game: Game }) {
  return <div className="card">{game.title}</div>;
}
