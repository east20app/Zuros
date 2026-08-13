import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { DashboardAppsGrid } from "@/components/DashboardAppsGrid";
import { listMyApps } from "@/lib/actions/apps.actions";
import { isExpiring } from "@/lib/status";
import { requireUser } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Meus Bots · ZUROS APP",
    description: "Gerencie seus bots e renove sua assinatura.",
};

export default async function DashboardPage() {
    await requireUser();
    const apps = await listMyApps();

    const sorted = [...apps].sort((a, b) => {
        const rank = (app: (typeof apps)[number]) => {
            let r = 0;
            if (app.errorOnUpdate) r += 1000;
            if (isExpiring(app.expiresAt, app.lifetime)) r += 500;
            if (app.status !== "active") r += 200;
            return r;
        };
        const diff = rank(b) - rank(a);
        if (diff !== 0) return diff;
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        return aTime - bTime;
    });

    return (
        <main className="mx-auto min-w-0 max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <PageHeader
                title="Minhas Aplicações"
                subtitle={apps.length ? `${apps.length} aplicação(ões) · clique em um bot para gerenciar` : undefined}
            />

            <div className="mt-6">
                {sorted.length === 0 ? (
                    <p className="py-2 text-base text-zinc-300">Você ainda não possui nenhuma aplicação.</p>
                ) : (
                    <DashboardAppsGrid apps={sorted} />
                )}
            </div>
        </main>
    );
}
