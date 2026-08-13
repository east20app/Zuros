import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description: "Como a ZUROS coleta, usa, compartilha e protege seus dados pessoais, em conformidade com a LGPD.",
    alternates: { canonical: "/privacidade" },
    openGraph: {
        title: "Política de Privacidade · ZUROS APP",
        description: "Como a ZUROS coleta, usa, compartilha e protege seus dados pessoais, em conformidade com a LGPD.",
        type: "article",
        url: "/privacidade",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZUROS APP" }],
    },
};

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-300">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">← Início</Link>
            <h1 className="mt-8 text-4xl font-semibold text-white">Política de Privacidade</h1>
            <p className="mt-6 leading-7">
                A ZUROS respeita a sua privacidade e trata seus dados pessoais em conformidade com a Lei
                Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Esta política explica quais dados
                coletamos, para quais finalidades, com quais bases legais e como você pode exercer seus
                direitos.
            </p>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">1. Dados que coletamos</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
                    <li><b className="text-white">Conta Discord (OAuth):</b> ID, nome de usuário, avatar e e-mail associado, usados para autenticação e para vincular aplicações, lojas e cobranças à sua conta.</li>
                    <li><b className="text-white">Dados de pagamento:</b> informações de transações PIX processadas por nossos parceiros (EFI e PromissePay), como identificador da cobrança, valor e status. Não armazenamos chaves PIX de terceiros nem dados de cartão.</li>
                    <li><b className="text-white">Dados operacionais das aplicações:</b> nome do bot, runtime, comandos de execução e métricas de uso/telemetria necessárias à hospedagem. Tokens de bot são usados para provisionar o serviço e mantidos de forma protegida, nunca exibidos publicamente.</li>
                    <li><b className="text-white">Dados técnicos:</b> logs de acesso, endereço IP e informações do dispositivo/navegador para segurança e prevenção a fraudes.</li>
                </ul>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">2. Finalidades e bases legais</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
                    <li><b className="text-white">Execução de contrato:</b> autenticar você, prover hospedagem, processar pagamentos e entregar as aplicações contratadas.</li>
                    <li><b className="text-white">Cumprimento de obrigação legal:</b> guarda de registros fiscais e de acesso exigidos por lei.</li>
                    <li><b className="text-white">Legítimo interesse:</b> segurança da plataforma, prevenção a fraudes e melhoria do serviço, sempre respeitando seus direitos.</li>
                </ul>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">3. Compartilhamento com terceiros</h2>
                <p className="mt-3 leading-7">
                    Compartilhamos dados apenas com operadores essenciais à prestação do serviço:{" "}
                    <b className="text-white">Discord</b> (autenticação), <b className="text-white">EFI</b> e{" "}
                    <b className="text-white">PromissePay</b> (pagamentos PIX) e provedores de infraestrutura de
                    hospedagem. Não vendemos seus dados pessoais. O compartilhamento se limita ao necessário
                    para cada finalidade.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">4. Retenção</h2>
                <p className="mt-3 leading-7">
                    Mantemos seus dados pelo tempo necessário à prestação do serviço e ao cumprimento de
                    obrigações legais e regulatórias. Encerrada a conta, dados podem ser retidos por prazos
                    legais (por exemplo, registros financeiros e de acesso) e, depois, eliminados ou
                    anonimizados.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">5. Cookies e armazenamento local</h2>
                <p className="mt-3 leading-7">
                    Utilizamos cookies e armazenamento local estritamente necessários para manter sua sessão
                    autenticada (NextAuth) e o funcionamento do painel. Não usamos cookies de publicidade de
                    terceiros.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">6. Seus direitos</h2>
                <p className="mt-3 leading-7">
                    Você pode solicitar, a qualquer momento: confirmação de tratamento, acesso, correção,
                    anonimização, portabilidade, eliminação, informação sobre compartilhamentos e revogação de
                    consentimento. Para exercê-los, escreva para{" "}
                    <a className="text-emerald-400 hover:text-emerald-300" href="mailto:suporte@zuros.app">suporte@zuros.app</a>.
                    Responderemos dentro dos prazos previstos na LGPD.
                </p>
            </section>

            <p className="mt-10 text-sm text-zinc-500">
                Consulte também os nossos{" "}
                <Link className="text-emerald-400 hover:text-emerald-300" href="/termos">Termos de Uso</Link>{" "}
                e a{" "}
                <Link className="text-emerald-400 hover:text-emerald-300" href="/reembolso">Política de Reembolso</Link>.
            </p>
        </main>
    );
}
