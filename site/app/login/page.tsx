import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrar",
    description: "Acesse o painel de gerenciamento de bots, lojas e aplicações da ZUROS.",
    alternates: { canonical: "/login" },
    robots: { index: false, follow: true },
    openGraph: {
        title: "Entrar · ZUROS APP",
        description: "Acesse o painel de gerenciamento de bots, lojas e aplicações da ZUROS.",
        type: "website",
        url: "/login",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZUROS APP" }],
    },
};

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
