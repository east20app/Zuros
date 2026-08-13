import type { Metadata } from "next";
import "@/app/globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/Toast";
import ChunkRecovery from "@/components/ChunkRecovery";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: { default: "ZUROS APP", template: "%s · ZUROS APP" },
    description: "Hospede, venda e gerencie aplicações Discord em um só lugar.",
    applicationName: "ZUROS APP",
    icons: { icon: "/icon.svg", shortcut: "/favicon.ico" },
    openGraph: {
        type: "website",
        siteName: "ZUROS APP",
        locale: "pt_BR",
        url: siteUrl,
        title: "ZUROS APP",
        description: "Bots Discord, vendas PIX e hospedagem conectados.",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZUROS APP" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "ZUROS APP",
        description: "Bots Discord, vendas PIX e hospedagem conectados.",
        images: ["/og.png"],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className="bg-background">
            <body className="min-h-screen text-zinc-200 antialiased">
                <ChunkRecovery />
                <SessionProvider>
                    <ToastProvider>{children}</ToastProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
