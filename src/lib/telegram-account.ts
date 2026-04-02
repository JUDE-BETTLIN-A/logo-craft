import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { CustomFile } from "telegram/client/uploads";
import bigInt from "big-integer";
import { prisma } from "@/lib/prisma";
import type { TelegramAccountStatus } from "@/lib/negotiator-types";

const DEFAULT_CONNECTION_ID = "default";

let cachedClient:
  | {
      sessionKey: string;
      promise: Promise<TelegramClient>;
    }
  | null = null;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "errorMessage" in error) {
    const value = (error as { errorMessage?: unknown }).errorMessage;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}

function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");

  if (!digits) {
    throw new Error("Phone number is required.");
  }

  const normalized = digits.startsWith("+")
    ? digits
    : digits.startsWith("00")
      ? `+${digits.slice(2)}`
      : `+${digits}`;

  if (!/^\+\d{7,15}$/.test(normalized)) {
    throw new Error("Use a valid phone number with country code, for example +15551234567.");
  }

  return normalized;
}

function getTelegramCredentials() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH?.trim();

  if (!Number.isInteger(apiId) || !apiHash) {
    return null;
  }

  return { apiId, apiHash };
}

function requireTelegramCredentials() {
  const credentials = getTelegramCredentials();

  if (!credentials) {
    throw new Error("TELEGRAM_API_ID and TELEGRAM_API_HASH must be configured.");
  }

  return credentials;
}

function buildTelegramDeepLink(phoneNumber: string, draftText?: string) {
  const phone = phoneNumber.replace(/^\+/, "");
  const query = draftText ? `?text=${encodeURIComponent(draftText)}` : "";
  return {
    app: `tg://resolve?phone=${phone}${query ? `&text=${encodeURIComponent(draftText ?? "")}` : ""}`,
    web: `https://t.me/+${phone}${query}`,
  };
}

function getSessionString(client: TelegramClient): string {
  return String((client.session as StringSession).save());
}

async function ensureConnectionRecord() {
  return prisma.telegramConnection.upsert({
    where: { id: DEFAULT_CONNECTION_ID },
    update: {},
    create: { id: DEFAULT_CONNECTION_ID },
  });
}

async function createClient(sessionString: string) {
  const credentials = requireTelegramCredentials();
  const client = new TelegramClient(
    new StringSession(sessionString),
    credentials.apiId,
    credentials.apiHash,
    {
      connectionRetries: 5,
      deviceModel: "PIXui Negotiator",
      systemVersion: `Node ${process.version}`,
      appVersion: "1.0.0",
    },
  );

  await client.connect();

  return client;
}

async function getCachedClient(sessionString: string) {
  if (cachedClient && cachedClient.sessionKey === sessionString) {
    return cachedClient.promise;
  }

  const previous = cachedClient;
  const promise = createClient(sessionString);
  cachedClient = {
    sessionKey: sessionString,
    promise,
  };

  if (previous) {
    previous.promise
      .then((client) => client.disconnect())
      .catch(() => undefined);
  }

  return promise;
}

async function persistConnectionSession(
  client: TelegramClient,
  data: Parameters<typeof prisma.telegramConnection.update>[0]["data"],
) {
  const sessionString = getSessionString(client);

  await prisma.telegramConnection.update({
    where: { id: DEFAULT_CONNECTION_ID },
    data: {
      sessionString,
      ...data,
    },
  });

  cachedClient = {
    sessionKey: sessionString,
    promise: Promise.resolve(client),
  };
}

function mapAccountStatus(
  connection: Awaited<ReturnType<typeof ensureConnectionRecord>>,
): TelegramAccountStatus {
  return {
    apiConfigured: Boolean(getTelegramCredentials()),
    connected: connection.state === "connected" && Boolean(connection.sessionString),
    state: connection.state,
    phoneNumber: connection.phoneNumber,
    displayName: connection.selfDisplayName,
    username: connection.selfUsername,
    passwordHint: connection.passwordHint,
    codeViaApp: connection.codeViaApp,
  };
}

function isApiUser(user: Api.TypeUser | undefined): user is Api.User {
  return Boolean(user && user instanceof Api.User);
}

function getDisplayName(user: Api.User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.username || "Telegram user";
}

async function getManagedClient(options?: { allowUnauthenticated?: boolean }) {
  const connection = await ensureConnectionRecord();
  const client = await getCachedClient(connection.sessionString ?? "");
  const authorized = await client.checkAuthorization();

  if (!authorized && !options?.allowUnauthenticated) {
    throw new Error("Connect your Telegram account first.");
  }

  return {
    client,
    connection,
    authorized,
  };
}

async function persistAuthorizedClient(client: TelegramClient, phoneNumber: string) {
  const me = await client.getMe();

  await persistConnectionSession(client, {
    phoneNumber,
    selfUserId: String(me.id),
    selfUsername: me.username ?? null,
    selfDisplayName: getDisplayName(me),
    state: "connected",
    pendingPhoneNumber: null,
    pendingCodeHash: null,
    passwordHint: null,
    codeViaApp: false,
  });
}

export function isTelegramApiConfigured() {
  return Boolean(getTelegramCredentials());
}

export function getTelegramChatLinks(phoneNumber: string, draftText?: string) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  return buildTelegramDeepLink(normalizedPhoneNumber, draftText);
}

export async function getTelegramAccountStatus() {
  const connection = await ensureConnectionRecord();

  if (!getTelegramCredentials()) {
    return mapAccountStatus(connection);
  }

  if (!connection.sessionString) {
    return mapAccountStatus(connection);
  }

  try {
    const { client, authorized } = await getManagedClient({
      allowUnauthenticated: true,
    });

    if (authorized) {
      const me = await client.getMe();
      await persistConnectionSession(client, {
        phoneNumber: connection.phoneNumber,
        selfUserId: String(me.id),
        selfUsername: me.username ?? null,
        selfDisplayName: getDisplayName(me),
        state: "connected",
        pendingPhoneNumber: null,
        pendingCodeHash: null,
        passwordHint: null,
        codeViaApp: false,
      });

      return mapAccountStatus(await ensureConnectionRecord());
    }
  } catch {
    return mapAccountStatus(connection);
  }

  return mapAccountStatus(connection);
}

export async function startTelegramLogin(phoneNumber: string) {
  requireTelegramCredentials();

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const { client, authorized } = await getManagedClient({
    allowUnauthenticated: true,
  });

  if (authorized) {
    return getTelegramAccountStatus();
  }

  const credentials = requireTelegramCredentials();
  const result = await client.sendCode(credentials, normalizedPhoneNumber);

  await persistConnectionSession(client, {
    phoneNumber: normalizedPhoneNumber,
    pendingPhoneNumber: normalizedPhoneNumber,
    pendingCodeHash: result.phoneCodeHash,
    passwordHint: null,
    codeViaApp: result.isCodeViaApp,
    state: "code_sent",
  });

  return getTelegramAccountStatus();
}

export async function verifyTelegramLogin(code: string, password?: string) {
  requireTelegramCredentials();

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    throw new Error("Verification code is required.");
  }

  const { client, connection } = await getManagedClient({
    allowUnauthenticated: true,
  });

  if (!connection.pendingPhoneNumber || !connection.pendingCodeHash) {
    throw new Error("Start Telegram login first to receive a code.");
  }

  try {
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: connection.pendingPhoneNumber,
        phoneCodeHash: connection.pendingCodeHash,
        phoneCode: trimmedCode,
      }),
    );

    if (result instanceof Api.auth.AuthorizationSignUpRequired) {
      throw new Error("That number is not registered on Telegram.");
    }

    await persistAuthorizedClient(client, connection.pendingPhoneNumber);

    return {
      status: await getTelegramAccountStatus(),
      needsPassword: false,
    };
  } catch (error) {
    if (getErrorMessage(error) !== "SESSION_PASSWORD_NEEDED") {
      throw error;
    }

    if (!password) {
      const passwordInfo = await client.invoke(new Api.account.GetPassword());

      await persistConnectionSession(client, {
        state: "password_required",
        passwordHint: passwordInfo.hint ?? null,
      });

      return {
        status: await getTelegramAccountStatus(),
        needsPassword: true,
      };
    }

    const credentials = requireTelegramCredentials();
    await client.signInWithPassword(credentials, {
      password: async () => password,
      onError: (innerError) => {
        throw innerError;
      },
    });

    await persistAuthorizedClient(client, connection.pendingPhoneNumber);

    return {
      status: await getTelegramAccountStatus(),
      needsPassword: false,
    };
  }
}

export async function disconnectTelegramAccount() {
  await ensureConnectionRecord();

  if (cachedClient) {
    cachedClient.promise
      .then((client) => client.disconnect())
      .catch(() => undefined);
  }

  cachedClient = null;

  await prisma.telegramConnection.update({
    where: { id: DEFAULT_CONNECTION_ID },
    data: {
      phoneNumber: null,
      sessionString: null,
      selfUserId: null,
      selfUsername: null,
      selfDisplayName: null,
      state: "disconnected",
      pendingPhoneNumber: null,
      pendingCodeHash: null,
      passwordHint: null,
      codeViaApp: false,
    },
  });

  return getTelegramAccountStatus();
}

export async function getAuthorizedTelegramClient() {
  const { client } = await getManagedClient();
  return client;
}

export async function resolveTelegramCustomer(phoneNumber: string, label: string) {
  const client = await getAuthorizedTelegramClient();
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  try {
    const existing = await client.invoke(
      new Api.contacts.ResolvePhone({ phone: normalizedPhoneNumber }),
    );
    const resolvedUser = existing.users.find(isApiUser);

    if (resolvedUser) {
      return {
        phoneNumber: normalizedPhoneNumber,
        peerId: await client.getPeerId(resolvedUser),
        displayName: getDisplayName(resolvedUser),
        username: resolvedUser.username ?? null,
      };
    }
  } catch {
    // Fall through to contact import.
  }

  const imported = await client.invoke(
    new Api.contacts.ImportContacts({
      contacts: [
        new Api.InputPhoneContact({
          clientId: bigInt(Date.now()),
          phone: normalizedPhoneNumber,
          firstName: label.trim().slice(0, 64) || "Customer",
          lastName: "",
        }),
      ],
    }),
  );

  const importedUser = imported.users.find(isApiUser);

  if (!importedUser) {
    throw new Error(
      "Telegram could not resolve that customer number. The customer may not have a Telegram account on that phone number.",
    );
  }

  return {
    phoneNumber: normalizedPhoneNumber,
    peerId: await client.getPeerId(importedUser),
    displayName: getDisplayName(importedUser),
    username: importedUser.username ?? null,
  };
}

export async function getCustomerInputEntity(
  phoneNumber: string,
  label: string,
) {
  const client = await getAuthorizedTelegramClient();
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  try {
    return await client.getInputEntity(normalizedPhoneNumber);
  } catch {
    await resolveTelegramCustomer(normalizedPhoneNumber, label);
    return client.getInputEntity(normalizedPhoneNumber);
  }
}

export async function sendTelegramText(
  phoneNumber: string,
  label: string,
  text: string,
) {
  const client = await getAuthorizedTelegramClient();
  const entity = await getCustomerInputEntity(phoneNumber, label);
  return client.sendMessage(entity, { message: text });
}

export async function sendTelegramFile(
  phoneNumber: string,
  label: string,
  fileName: string,
  fileSize: number,
  fileBuffer: Buffer,
  caption: string,
) {
  const client = await getAuthorizedTelegramClient();
  const entity = await getCustomerInputEntity(phoneNumber, label);
  const customFile = new CustomFile(fileName, fileSize, "", fileBuffer);
  return client.sendFile(entity, { file: customFile, caption });
}

export async function getRecentTelegramMessages(
  phoneNumber: string,
  label: string,
  limit = 30,
) {
  const client = await getAuthorizedTelegramClient();
  const entity = await getCustomerInputEntity(phoneNumber, label);
  const messages = await client.getMessages(entity, { limit });

  return messages
    .filter((message): message is Api.Message => message instanceof Api.Message)
    .sort((left, right) => left.id - right.id);
}

export { getErrorMessage, normalizePhoneNumber };
