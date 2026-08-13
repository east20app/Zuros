import type { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

function envWithFallback(key: string, devFallback: string): string {
    const value = process.env[key];
    if (value) return value;
    // O Next importa todas as rotas durante "Collecting page data". Nessa fase
    // não há sessão nem OAuth real; placeholders evitam que o build dependa de
    // segredos, mantendo a validação obrigatória nas invocações de produção.
    if (process.env.NEXT_PHASE === "phase-production-build") return devFallback;
    if (process.env.NODE_ENV === "production") {
        throw new Error(`Missing required environment variable "${key}".`);
    }
    console.warn(`[auth] "${key}" não está definido. Usando fallback de desenvolvimento.`);
    return devFallback;
}

function validatedAuthUrl(): URL {
    const rawUrl = envWithFallback("NEXTAUTH_URL", "http://localhost:3000");
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error('NEXTAUTH_URL inválida. Use uma única URL completa, como "https://painel.exemplo.com".');
    }

    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error("NEXTAUTH_URL deve conter apenas uma origem HTTP ou HTTPS válida.");
    }
    return url;
}

const authUrl = validatedAuthUrl();
// Sem barra final: uma divergência aqui muda o nome do cookie de sessão
// (`next-auth.session-token` vs `__Secure-next-auth.session-token`) e derruba
// sessões que já estavam ativas no navegador.
const secureCookies = authUrl.protocol === "https:";

export const authOptions: AuthOptions = {
    useSecureCookies: secureCookies,
    providers: [
        DiscordProvider({
            clientId: envWithFallback("DISCORD_CLIENT_ID", "missing-discord-client-id"),
            clientSecret: envWithFallback("DISCORD_CLIENT_SECRET", "missing-discord-client-secret"),
            authorization: {
                params: { scope: "identify email guilds" },
            },
        }),
    ],
    session: {
        strategy: "jwt",
        // 30 dias, com re-assinatura diária. Evita que expiração agressiva derrube
        // o usuário durante a navegação entre os módulos do painel.
        maxAge: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
    },
    cookies: {
        sessionToken: {
            name: secureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: secureCookies,
            },
        },
        callbackUrl: {
            name: secureCookies ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
            options: {
                sameSite: "lax",
                path: "/",
                secure: secureCookies,
            },
        },
        csrfToken: {
            name: secureCookies ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: secureCookies,
            },
        },
        pkceCodeVerifier: {
            name: secureCookies ? "__Secure-next-auth.pkce.code_verifier" : "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: secureCookies,
            },
        },
    },
    secret: envWithFallback("NEXTAUTH_SECRET", "dev-insecure-secret"),
    // Nunca habilitar debug: o NextAuth inclui tokens OAuth nos eventos detalhados.
    debug: false,
    callbacks: {
        // Persiste a identidade inteira no JWT. Assim a sessão sobrevive a
        // re-hidratações do token sem depender de nova consulta ao provedor.
        async jwt({ token, user }) {
            if (user) {
                token.discordId = user.id;
                if (user.name) token.name = user.name;
                if (user.email) token.email = user.email;
                if (user.image) token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.discordId = token.discordId || "";
                // Fallbacks garantem que a sessão continua "autenticada" mesmo se
                // o token não carregar o perfil completo (ex.: JWT antigo).
                if (!session.user.name && token.name) session.user.name = token.name;
                if (!session.user.email && token.email) session.user.email = token.email;
                if (!session.user.image && token.picture) session.user.image = token.picture;
            }
            return session;
        },
        // Mantém o usuário dentro do painel: aceita apenas URLs da própria origem
        // ou caminhos relativos, evitando redirecionamentos abertos.
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/dashboard`;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};
