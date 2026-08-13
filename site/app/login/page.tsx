import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
    title: "Entrar · ZUROS APP",
    description: "Acesse o painel de gerenciamento de bots.",
};

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
