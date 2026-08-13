import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrar · ZUROS APP",
    description: "Acesse o painel de gerenciamento de bots.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
