/**
 * Resolve a URL pública absoluta do site para uso em metadataBase, OG, canonical,
 * robots.ts e sitemap.ts. Prioridade:
 *   1. NEXTAUTH_URL (definida em produção pelo processo host)
 *   2. VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL (deploy na Vercel)
 *   3. localhost como último recurso (apenas dev)
 *
 * Evita que URLs absolutas caiam silenciosamente em http://localhost:3000 em
 * produção quando NEXTAUTH_URL não estiver configurada.
 */
export function getSiteUrl(): string {
    const explicit = process.env.NEXTAUTH_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, "");

    const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (vercelProd) return `https://${vercelProd.replace(/^https?:\/\//, "")}`;

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

    return "http://localhost:3000";
}

/** Rotas públicas indexáveis, usadas pelo sitemap. */
export const PUBLIC_ROUTES = ["/", "/planos", "/login", "/privacidade", "/termos", "/reembolso"] as const;
