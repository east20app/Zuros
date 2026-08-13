import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionError } from "@/lib/actions/context";
import { getDroxPaymentProviders, getVendasContext } from "@/lib/actions/vendas.actions";
import { requireUser } from "@/lib/require-admin";
import { Card, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { appId: string } }): Promise<Metadata> {
    try {
        const ctx = await getVendasContext(params.appId);
        return { title: `Pagamentos · ${ctx.botName} · ZUROS APP`, description: `Formas de pagamento do bot ${ctx.botName}.` };
    } catch {
        return { title: "Pagamentos · ZUROS APP" };
    }
}

export default async function PagamentosPage({ params }: { params: { appId: string } }) {
    await requireUser();

    let ctx;
    try {
        ctx = await getVendasContext(params.appId);
    } catch (error) {
        if (error instanceof ActionError) {
            notFound();
        }
        throw error;
    }
    const providers = await getDroxPaymentProviders(params.appId);

    return (
        <main className="mx-auto max-w-6xl px-5 py-8">
            <div className="mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-white">Formas de pagamento</h1>
                </div>
                <p className="mt-1.5 text-sm text-zinc-500">Bot {ctx.botName} · Configuração comercial do DROX</p>
            </div>

            <Card className="flex flex-col items-start gap-3">
                <h2 className="text-sm font-semibold text-white">Pagamentos gerenciados pelo bot</h2>
                <p className="max-w-2xl text-sm text-zinc-400">
                    Esta área usa a configuração da loja do bot DROX. As credenciais da plataforma ZUROS não são aplicadas às vendas deste bot.
                </p>
                <Button href={`/dashboard/${params.appId}/config/loja`}>Abrir configuração da loja DROX</Button>
            </Card>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                    <Card key={provider.id} className="flex items-center justify-between gap-3">
                        <div><p className="text-sm font-semibold text-white">{provider.name}</p><p className="mt-1 text-xs text-zinc-500">{provider.configured ? "Credenciais configuradas" : "Não configurado"}</p></div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${provider.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>{provider.enabled ? "Ativo" : "Inativo"}</span>
                    </Card>
                ))}
            </div>
        </main>
    );
}
