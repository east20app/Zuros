import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Reembolso",
    description: "Regras de reembolso, cancelamento e renovação dos planos e aplicações da ZUROS.",
    alternates: { canonical: "/reembolso" },
    openGraph: {
        title: "Política de Reembolso · ZUROS APP",
        description: "Regras de reembolso, cancelamento e renovação dos planos e aplicações da ZUROS.",
        type: "article",
        url: "/reembolso",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZUROS APP" }],
    },
};

export default function RefundPage() {
    return (
        <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-300">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">← Início</Link>
            <h1 className="mt-8 text-4xl font-semibold text-white">Política de Reembolso</h1>
            <p className="mt-6 leading-7">
                Esta política descreve como tratamos solicitações de reembolso, cancelamento e renovação
                dos planos e aplicações contratados na ZUROS. Ao concluir uma compra, você declara ter
                lido e concordado com as condições abaixo.
            </p>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">1. Direito de arrependimento</h2>
                <p className="mt-3 leading-7">
                    Conforme o art. 49 do Código de Defesa do Consumidor, compras realizadas fora do
                    estabelecimento (como pela internet) podem ser canceladas em até 7 (sete) dias corridos
                    a contar da confirmação do pagamento, desde que o serviço ainda não tenha sido
                    integralmente utilizado. Nesses casos, o valor pago é devolvido integralmente pelo mesmo
                    meio de pagamento (PIX).
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">2. Serviços já utilizados</h2>
                <p className="mt-3 leading-7">
                    Como os planos envolvem provisionamento imediato de hospedagem e execução de aplicações,
                    o consumo de recursos após a ativação pode ser descontado proporcionalmente do valor a
                    ser reembolsado. Planos vitalícios já ativados e produtos digitais entregues não são
                    elegíveis a reembolso após o uso, salvo em caso de falha comprovada do serviço.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">3. Renovações</h2>
                <p className="mt-3 leading-7">
                    Renovações são cobradas de forma avulsa a cada ciclo (semanal, quinzenal ou mensal) e não
                    são automáticas. Você só é cobrado ao gerar e pagar um novo PIX de renovação. Valores de
                    renovação já pagos seguem as mesmas regras de reembolso descritas nesta política.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">4. Falhas de serviço</h2>
                <p className="mt-3 leading-7">
                    Se a aplicação não puder ser entregue ou ficar indisponível por falha atribuível à ZUROS,
                    você pode solicitar reembolso proporcional ao período afetado ou a reexecução do serviço,
                    sem custo adicional. Indisponibilidades causadas por token inválido, uso indevido ou
                    violação dos Termos de Uso não geram direito a reembolso.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">5. Como solicitar</h2>
                <p className="mt-3 leading-7">
                    Envie sua solicitação para{" "}
                    <a className="text-emerald-400 hover:text-emerald-300" href="mailto:suporte@zuros.app">suporte@zuros.app</a>{" "}
                    informando o e-mail/ID Discord da conta, o produto e o motivo. As solicitações são
                    analisadas em até 5 (cinco) dias úteis, e reembolsos aprovados são processados em até 10
                    (dez) dias úteis pelo mesmo meio de pagamento.
                </p>
            </section>

            <p className="mt-10 text-sm text-zinc-500">
                Consulte também os nossos{" "}
                <Link className="text-emerald-400 hover:text-emerald-300" href="/termos">Termos de Uso</Link>{" "}
                e a{" "}
                <Link className="text-emerald-400 hover:text-emerald-300" href="/privacidade">Política de Privacidade</Link>.
            </p>
        </main>
    );
}
