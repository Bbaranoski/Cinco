'use client';

import React, { useEffect } from "react";
import GameModeCard from "@/components/GameModeCard";
import { useRouter } from "next/router";

export default function Home() {


  return (
    <main className="bg-stone-500 min-h-screen flex items-center p-6">
      <div className="max-w-5xl w-full">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">WinMo</h1>
          <p className="text-gray-600 dark:text-gray-300">Escolha o modo de jogo para começar</p>
        </header>

        <section className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <GameModeCard
            href="/solo"
            title="Modo Solo"
            emoji="🧠"
            description="Jogue contra o sistema. Bom para treinar e testar palavras"
          />

          <GameModeCard
            href="/multi"
            title="Multiplayer"
            emoji="⚔️"
            description="Enfrente um amgio em partidas turn-based."
          />
        </section>
      </div>
    </main>
  );
}
