"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error("[v0] Erro em página pública:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-zinc-300">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-lg font-bold text-emerald-400">Z</span>
            <h1 className="text-2xl font-semibold text-white text-balance">Não foi possível carregar esta página</h1>
            <p className="max-w-md text-sm leading-6 text-zinc-500 text-pretty">
                Tivemos um problema temporário ao carregar o conteúdo. Tente novamente em instantes ou volte
                para a página inicial.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    onClick={reset}
                    className="rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-px hover:from-emerald-300 hover:to-emerald-500"
                >
                    Tentar novamente
                </button>
                <Link
                    href="/"
                    className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                >
                    Voltar ao início
                </Link>
            </div>
        </main>
    );
}
