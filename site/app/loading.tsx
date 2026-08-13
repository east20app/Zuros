export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Carregando">
            <div className="flex flex-col items-center gap-4">
                <span className="grid h-12 w-12 animate-pulse place-items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-lg font-bold text-emerald-400">Z</span>
                <span className="skeleton h-1 w-24 rounded-full" />
                <span className="sr-only">Carregando conteúdo...</span>
            </div>
        </div>
    );
}
