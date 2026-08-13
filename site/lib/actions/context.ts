import databases from "@root/src/databases";
import sdkWrapper from "@root/src/functions/camposcloud-sdk";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export class ActionError extends Error {}

export async function getSessionUser(): Promise<{ discordId: string } | null> {
    const { authOptions } = await import("@/lib/auth");
    const { getServerSession } = await import("next-auth");
    // Tentativas com backoff curto: o contexto de requisição pode ainda não
    // estar pronto na primeira chamada de uma Server Action durante navegação,
    // o que gerava "Não autenticado" e derrubava o usuário para o login.
    const delays = [50, 150];
    for (let attempt = 0; attempt < 3; attempt++) {
        const session = await getServerSession(authOptions);
        if (session?.user?.discordId) return { discordId: session.user.discordId };
        if (attempt < delays.length) await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
    return null;
}

export async function requireSessionUser(): Promise<string> {
    const user = await getSessionUser();
    if (!user) {
        throw new ActionError("Não autenticado.");
    }
    return user.discordId;
}

export async function getStoresForUser(discordId: string) {
    const settings = await databases.userSettings.findOne({ userId_discord: discordId }, { userId_campos: 1 });
    return databases.stores.find({
        $or: [
            { ownerId_campos: settings?.userId_campos || "__none__" },
            { "permissions.userId": discordId },
        ],
    });
}

export async function canAccessAdmin(discordId: string): Promise<boolean> {
    if (process.env.OWNER_ID && discordId === process.env.OWNER_ID) return true;
    const settings = await databases.userSettings.findOne({ userId_discord: discordId }, { userId_campos: 1 });
    const store = await databases.stores.findOne({
        $or: [
            { ownerId_campos: settings?.userId_campos || "__none__" },
            { permissions: { $elemMatch: { userId: discordId, permissions: "admin" } } },
        ],
    }, { _id: 1 });
    return !!store;
}

export async function getOwnerDiscordId(storeId: string): Promise<string | null> {
    const store = await databases.stores.findById(storeId, { ownerId_campos: 1 });
    if (!store?.ownerId_campos) return null;
    const ownerSettings = await databases.userSettings.findOne(
        { userId_campos: store.ownerId_campos },
        { userId_discord: 1 }
    );
    return ownerSettings?.userId_discord || null;
}

export async function getStoreSdk(storeId: string) {
    const ownerDiscordId = await getOwnerDiscordId(storeId);
    if (!ownerDiscordId) return null;
    const sdk = await sdkWrapper.getInstance(ownerDiscordId).catch(() => null);
    if (!sdk || !sdk.isValid) return null;
    return sdk.instance;
}
