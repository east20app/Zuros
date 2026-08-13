import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Termos de Uso",
    description: "Regras de uso, renovação, responsabilidades e condições de suspensão de conta da ZUROS.",
    alternates: { canonical: "/termos" },
    openGraph: {
        title: "Termos de Uso · ZUROS APP",
        description: "Regras de uso, renovação, responsabilidades e condições de suspensão de conta da ZUROS.",
        type: "article",
        url: "/termos",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZUROS APP" }],
    },
};

export default function TermsPage() {
    return (
        <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-300">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">← Início</Link>
            <h1 className="mt-8 text-4xl font-semibold text-white">Termos de Uso</h1>
            <p className="mt-6 leading-7">
                Estes Termos regem o uso da plataforma ZUROS. Ao criar uma conta ou realizar uma compra,
                você concorda integralmente com as condições abaixo.
            </p>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">1. Regras de uso</h2>
                <p className="mt-3 leading-7">
                    Você concorda em fornecer dados legítimos, manter suas credenciais seguras e não utilizar
                    a plataforma para atividades ilícitas, abusivas ou que violem os Termos de Serviço do
                    Discord. É proibido hospedar aplicações que distribuam malware, pratiquem spam, fraudes ou
                    infrinjam direitos de terceiros.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">2. Cancelamento e renovação</h2>
                <p className="mt-3 leading-7">
                    Planos, prazos de carência e preços são apresentados antes da compra. As renovações são
                    avulsas por ciclo (semanal, quinzenal ou mensal) e não são automáticas: a cobrança só
                    ocorre quando você gera e paga um novo PIX. A não renovação dentro do prazo pode resultar
                    na suspensão da aplicação. As condições de devolução estão descritas na{" "}
                    <Link className="text-emerald-400 hover:text-emerald-300" href="/reembolso">Política de Reembolso</Link>.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">3. Responsabilidades</h2>
                <p className="mt-3 leading-7">
                    A ZUROS é responsável por disponibilizar a infraestrutura de hospedagem e as ferramentas
                    do painel com esforço razoável de disponibilidade. O lojista/usuário é responsável pelo
                    conteúdo, configuração e conformidade legal das aplicações que hospeda, bem como pela
                    veracidade das informações prestadas aos seus próprios clientes.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">4. Suspensão de conta</h2>
                <p className="mt-3 leading-7">
                    Podemos suspender ou encerrar contas e aplicações que violem estes Termos, representem
                    risco à plataforma ou a terceiros, ou estejam com pagamentos pendentes. Sempre que
                    possível, notificaremos previamente. Casos de fraude ou risco iminente podem ser tratados
                    com suspensão imediata.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">5. Contato</h2>
                <p className="mt-3 leading-7">
                    Para dúvidas sobre estes Termos, escreva para{" "}
                    <a className="text-emerald-400 hover:text-emerald-300" href="mailto:suporte@zuros.app">suporte@zuros.app</a>.
                </p>
            </section>

            <p className="mt-10 text-sm text-zinc-500">
                Consulte também a nossa{" "}
                <Link className="text-emerald-400 hover:text-emerald-300" href="/privacidade">Política de Privacidade</Link>.
            </p>
        </main>
    );
}
