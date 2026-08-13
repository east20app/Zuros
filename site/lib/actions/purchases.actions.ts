"use server";

import crypto from "crypto";
import axios from "axios";
import QRCode from "qrcode";
import { QrCodePix } from "qrcode-pix";
import databases from "@root/src/databases";
import efiWrapper from "@root/src/functions/efi_wrapper";
import promisseWrapper from "@root/src/functions/promisse_wrapper";
import sdkWrapper from "@root/src/functions/camposcloud-sdk";
import { buildHostedBotPackageBuffer, getReleasePath, releaseExists } from "@root/src/functions/hosted-bot";
import { buildApplicationEnvironment, buildApplicationPackageConfig } from "@root/src/integration/apps";
import type { IProducts } from "@root/src/databases/schemas/products";
import type { IStores } from "@root/src/databases/schemas/stores";
import type { IApplications } from "@root/src/databases/schemas/applications";
import type { HydratedDocument } from "mongoose";
import { calculatePixPrice, createPurchaseCart, getPurchaseCart, listStoreCatalogs, listStoreProducts } from "@root/src/integration";
import type { PurchasePlan } from "@root/src/integration";
import { requireSessionUser, type ActionResult } from "./context";

export async function getStoreCatalogs() {
    await requireSessionUser();
    return listStoreCatalogs();
}

export async function getStoreCatalog(storeId: string) {
    await requireSessionUser();
    return listStoreProducts(storeId);
}

export async function startPurchase(input: {
    storeId: string;
    productId: string;
    plan: PurchasePlan;
}): Promise<ActionResult<{ cartId: string }>> {
    try {
        const discordId = await requireSessionUser();
        const cart = await createPurchaseCart({ discordId, ...input });
        return { ok: true, data: { cartId: cart.id } };
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/campos\s*cloud|camposcloud|memória ram suficiente|dados do plano/i.test(message)) {
            return { ok: false, error: "Não há recursos disponíveis para criar uma nova aplicação no momento. Entre em contato com o suporte." };
        }
        return { ok: false, error: message || "Não foi possível criar o carrinho." };
    }
}

export async function getMyPurchaseCart(cartId: string) {
    const discordId = await requireSessionUser();
    return getPurchaseCart(discordId, cartId);
}

export async function generatePurchasePayment(cartId: string): Promise<{ qrcodeDataUrl: string; copyPaste: string; finalPrice: number }> {
    const discordId = await requireSessionUser();
    const cart = await databases.cartsBuy.findOne({ _id: cartId, userId: discordId }).populate("coupon");
    if (!cart) throw new Error("Carrinho não encontrado ou expirado.");
    if (cart.status !== "opened") throw new Error("Este carrinho não está disponível para pagamento.");
    if (cart.step === "waiting-payment" && cart.pix_qrcode && cart.pix_copy_and_paste) {
        return { qrcodeDataUrl: `data:image/png;base64,${cart.pix_qrcode}`, copyPaste: cart.pix_copy_and_paste, finalPrice: cart.finalPrice || cart.price };
    }
    if (cart.step !== "select-coupons") throw new Error("O pagamento deste carrinho já foi processado.");
    const store = await databases.stores.findById(cart.storeId);
    if (!store) throw new Error("Configuração de pagamento indisponível.");
    const settings = await databases.userSettings.findOne({ userId_campos: store.ownerId_campos });
    if (!settings) throw new Error("Configuração de pagamento indisponível.");
    const discount = (cart.coupon as unknown as { discount?: number } | null)?.discount || 0;
    const { charged: finalPrice } = calculatePixPrice(cart.price, discount);
    let qrcodeDataUrl = "";
    let copyPaste = "";
    let paymentId = "";

    if (settings.payment_gateway === "efi") {
        const gateway = await efiWrapper.getInstance(settings.userId_discord);
        const pixKey = settings.efi_credentials?.pix_key;
        if (!gateway?.isValid || !pixKey) throw new Error("Não foi possível iniciar o pagamento PIX. Entre em contato com o suporte.");
        const txid = crypto.randomBytes(16).toString("hex").slice(0, 26);
        const payment = await gateway.instance.pixCreateCharge({ txid }, { calendario: { expiracao: 1800 }, valor: { original: finalPrice.toFixed(2) }, chave: pixKey }).catch(() => null);
        if (!payment?.pixCopiaECola) throw new Error("Não foi possível gerar o pagamento PIX. Tente novamente.");
        copyPaste = payment.pixCopiaECola;
        qrcodeDataUrl = await QRCode.toDataURL(copyPaste, { errorCorrectionLevel: "M" });
        paymentId = payment.txid || txid;
    } else if (settings.payment_gateway === "manual") {
        const manual = settings.manual_payment_credentials;
        if (!manual?.pix_key || !manual.key_type) throw new Error("Pagamento PIX indisponível. Entre em contato com o suporte.");
        const transactionId = crypto.randomBytes(6).toString("hex").slice(0, 12);
        const qr = QrCodePix({ version: "01", key: manual.pix_key, name: "ZUROS APP", city: "SAO PAULO", transactionId, message: `Compra ${cart._id}`, value: finalPrice });
        qrcodeDataUrl = await qr.base64();
        copyPaste = qr.payload();
    } else if (settings.payment_gateway === "promisse") {
        const apiKey = settings.promissepay_credentials?.api_key;
        if (!apiKey) throw new Error("Pagamento PIX indisponível. Entre em contato com o suporte.");
        const transaction = await promisseWrapper.createTransaction(apiKey, Math.round(finalPrice * 100));
        if (!transaction) throw new Error("Não foi possível gerar o pagamento PIX. Tente novamente.");
        qrcodeDataUrl = `data:image/png;base64,${transaction.qrCodeBase64}`;
        copyPaste = transaction.copyPaste;
        paymentId = transaction.id;
    } else {
        throw new Error("Pagamento PIX indisponível. Entre em contato com o suporte.");
    }

    cart.pix_qrcode = qrcodeDataUrl.split(",")[1] || qrcodeDataUrl;
    cart.pix_copy_and_paste = copyPaste;
    cart.paymentId = paymentId || undefined;
    cart.finalPrice = finalPrice;
    cart.step = "waiting-payment";
    cart.expiresAt = new Date(Date.now() + 30 * 60_000);
    await cart.save();
    return { qrcodeDataUrl, copyPaste, finalPrice };
}

export async function pollPurchaseCart(cartId: string) {
    const discordId = await requireSessionUser();
    const cart = await getPurchaseCart(discordId, cartId);
    if (!cart) throw new Error("Carrinho não encontrado.");
    return cart;
}

export async function applyPurchaseCoupon(cartId: string, code: string): Promise<ActionResult<{ discount: number }>> {
    try {
        const discordId = await requireSessionUser();
        const normalized = code.trim();
        if (!normalized) throw new Error("Digite o código do cupom.");
        const cart = await databases.cartsBuy.findOne({ _id: cartId, userId: discordId, status: "opened", step: "select-coupons" });
        if (!cart) throw new Error("Este carrinho não aceita mais cupons.");
        const coupon = await databases.coupons.findOne({ code: normalized, storeId: cart.storeId });
        if (!coupon || coupon.remainingUses <= 0 || coupon.expiresAt < new Date()) throw new Error("Cupom inválido ou expirado.");
        if (coupon.roles?.length) throw new Error("Este cupom é exclusivo para cargos do servidor.");
        if (coupon.products?.length && !coupon.products.includes("all") && !coupon.products.includes(String(cart.productId))) {
            throw new Error("Este cupom não é válido para este produto.");
        }
        const claimed = await databases.coupons.findOneAndUpdate({ _id: coupon._id, remainingUses: { $gt: 0 } }, { $inc: { remainingUses: -1 } }, { new: true });
        if (!claimed) throw new Error("Este cupom não possui mais usos disponíveis.");
        cart.coupon = coupon._id as never;
        await cart.save();
        return { ok: true, data: { discount: coupon.discount } };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Não foi possível aplicar o cupom." };
    }
}

export async function deliverPurchaseApplication(input: { cartId: string; botName: string; botToken: string; serverId?: string }): Promise<ActionResult<{ applicationId: string }>> {
    let application: HydratedDocument<IApplications> | undefined;
    let hostedId = "";
    let sdk: Awaited<ReturnType<typeof sdkWrapper.getInstance>> | null = null;
    try {
        const discordId = await requireSessionUser();
        const botName = input.botName.trim();
        const botToken = input.botToken.trim();
        const serverId = input.serverId?.trim() || "";
        if (!botName || !botToken) throw new Error("Informe o nome e o token do bot.");
        if (botName.length > 25) throw new Error("O nome do bot pode ter no máximo 25 caracteres.");
        if (serverId && !/^\d{17,20}$/.test(serverId)) throw new Error("ID do servidor Discord inválido.");

        const cart = await databases.cartsBuy.findOne({ _id: input.cartId, userId: discordId, status: "opened", step: "payment-confirmed" }).populate("productId").populate("storeId");
        if (!cart) throw new Error("O pagamento ainda não foi confirmado ou o carrinho já foi entregue.");
        const product = cart.productId as unknown as IProducts;
        const store = cart.storeId as unknown as IStores;
        if (!product?.currentReleaseVersion || !store) throw new Error("Produto indisponível. Entre em contato com o suporte.");
        if (!await releaseExists(String(product._id), String(product.currentReleaseVersion)).catch(() => false)) throw new Error("Arquivo da aplicação indisponível. Entre em contato com o suporte.");

        const botInfo = await axios.get("https://discord.com/api/v10/applications/@me", { headers: { Authorization: `Bot ${botToken}` }, timeout: 15_000 }).catch(() => null);
        if (!botInfo?.data?.id) throw new Error("O token informado não pertence a um bot Discord válido.");
        const guilds = await axios.get("https://discord.com/api/v10/users/@me/guilds", { headers: { Authorization: `Bot ${botToken}` }, timeout: 15_000 }).catch(() => null);
        const availableGuilds = Array.isArray(guilds?.data) ? guilds.data : [];
        if (serverId && !availableGuilds.some((guild: { id: string }) => guild.id === serverId)) throw new Error("O bot não participa do servidor informado.");

        let detectedServerId = serverId || store.teamId_campos || "";
        if (!serverId) {
            if (availableGuilds.length === 1) {
                detectedServerId = availableGuilds[0].id;
            } else if (availableGuilds.length && store.teamId_campos && availableGuilds.some((guild: { id: string }) => guild.id === store.teamId_campos)) {
                detectedServerId = store.teamId_campos;
            }
        }

        const locked = await databases.cartsBuy.findOneAndUpdate({ _id: cart._id, status: "opened", step: "payment-confirmed" }, { $set: { status: "processing" } }, { new: true });
        if (!locked) throw new Error("Este carrinho já está sendo processado.");
        const owner = await databases.userSettings.findOne({ userId_campos: store.ownerId_campos });
        sdk = owner ? await sdkWrapper.getInstance(owner.userId_discord).catch(() => null) : null;
        const usage = owner ? await sdkWrapper.getPlanUsage(owner.userId_discord).catch(() => null) : null;
        if (!sdk?.isValid || !usage || usage.freeMemoryMB < (product.memoryMB || 256)) throw new Error("Não há recursos disponíveis para criar a aplicação agora. Entre em contato com o suporte.");

        application = await databases.applications.create({ storeId: store._id, productId: product._id, name: botName, ownerId: discordId, botId: botInfo.data.id, token: botToken, serverId: detectedServerId, expiresAt: locked.lifetime ? null : new Date(Date.now() + (locked.days || 30) * 86_400_000), version: product.currentReleaseVersion, lifetime: !!locked.lifetime });
        const config = { token: botToken, ownerId: discordId, applicationId: String(application._id), botId: botInfo.data.id, version: String(product.currentReleaseVersion), serverId: detectedServerId };
        const file = await buildHostedBotPackageBuffer(getReleasePath(String(product._id), String(product.currentReleaseVersion)), buildApplicationPackageConfig(config));
        const uploaded = await sdk.instance.createApplication({ appName: `${product.name}・${discordId}`, memoryMB: product.memoryMB || 256, mainFile: "N/A", runtimeEnvironment: product.runtimeEnvironment?.toLowerCase().includes("node") ? "nodejs" : "python", autoRestartEnabled: true, teamId: store.teamId_campos || undefined, startupCommand: product.runCommand, file, environmentVariables: buildApplicationEnvironment(config) });
        hostedId = uploaded.data._id;
        application.appId = hostedId;
        await application.save();
        await databases.cartsBuy.updateOne(
            { _id: locked._id, status: "processing" },
            { $set: { status: "closed", delivered: true, applicationId: application._id } }
        );
        return { ok: true, data: { applicationId: String(application._id) } };
    } catch (error) {
        console.error("[deliverPurchaseApplication] Erro ao entregar bot:", error);
        if (application) await databases.applications.deleteOne({ _id: application._id }).catch(() => undefined);
        if (hostedId && sdk) await sdk.instance.deleteApplication({ appId: hostedId }).catch(() => undefined);
        if (input.cartId) await databases.cartsBuy.updateOne({ _id: input.cartId, status: "processing" }, { $set: { status: "opened" } }).catch(() => undefined);

        let message = error instanceof Error ? error.message.replace(/CamposCloud/gi, "hospedagem") : "Não foi possível entregar a aplicação.";
        if (axios.isAxiosError(error)) {
            const body = error.response?.data;
            const detail = typeof body === "string"
                ? body
                : body && typeof body === "object" && "message" in body && typeof (body as { message?: unknown }).message === "string"
                    ? (body as { message: string }).message
                    : undefined;
            const apiError = body && typeof body === "object" && "error" in body && typeof (body as { error?: unknown }).error === "string"
                ? (body as { error: string }).error
                : undefined;
            message = apiError || detail || `Falha de conexão com a hospedagem (HTTP ${error.response?.status ?? "?"}). Tente novamente.`;
        }
        return { ok: false, error: message };
    }
}
