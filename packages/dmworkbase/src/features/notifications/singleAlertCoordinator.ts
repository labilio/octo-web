const DATABASE_NAME = "octo-message-attention";
const DATABASE_VERSION = 1;
const CLAIM_STORE = "alert-claims";
const EXPIRES_INDEX = "expires-at";
const DEFAULT_CLAIM_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_EXPIRED_DELETIONS_PER_CLAIM = 50;

interface StoredAlertClaim {
  key: string;
  expiresAt: number;
}

export interface AlertClaimStore {
  claim(key: string, now?: number): Promise<boolean>;
}

export interface SingleAlertRequest {
  accountId: string;
  messageId?: string;
  clientMsgNo?: string;
  alert: () => void | Promise<void>;
}

interface AlertBroadcastMessage {
  type: "candidate" | "claimed";
  key: string;
}

interface AlertBroadcastChannel {
  postMessage(message: AlertBroadcastMessage): void;
  close?(): void;
}

export interface SingleAlertCoordinatorOptions {
  claimStore: AlertClaimStore;
  channel?: AlertBroadcastChannel;
}

export function buildAlertClaimKey(
  request: Omit<SingleAlertRequest, "alert">
): string | undefined {
  const stableMessageId = request.messageId || request.clientMsgNo;
  if (!request.accountId || !stableMessageId) return undefined;
  return JSON.stringify([request.accountId, stableMessageId]);
}

export class SingleAlertCoordinator {
  private readonly claimStore: AlertClaimStore;
  private readonly channel?: AlertBroadcastChannel;

  constructor(options: SingleAlertCoordinatorOptions) {
    this.claimStore = options.claimStore;
    this.channel = options.channel;
  }

  async runOnce(request: SingleAlertRequest): Promise<boolean> {
    const key = buildAlertClaimKey(request);
    if (!key) return false;
    this.channel?.postMessage({ type: "candidate", key });
    if (!(await this.claimStore.claim(key))) return false;
    this.channel?.postMessage({ type: "claimed", key });
    await request.alert();
    return true;
  }

  async claimOnly(
    request: Omit<SingleAlertRequest, "alert">
  ): Promise<boolean> {
    const key = buildAlertClaimKey(request);
    if (!key) return false;
    this.channel?.postMessage({ type: "candidate", key });
    const claimed = await this.claimStore.claim(key);
    if (claimed) this.channel?.postMessage({ type: "claimed", key });
    return claimed;
  }

  close(): void {
    this.channel?.close?.();
  }
}

export class InMemoryAlertClaimStore implements AlertClaimStore {
  private readonly expiresByKey = new Map<string, number>();
  constructor(private readonly ttlMs = DEFAULT_CLAIM_TTL_MS) {}

  async claim(key: string, now = Date.now()): Promise<boolean> {
    const existingExpiry = this.expiresByKey.get(key);
    if (existingExpiry !== undefined && existingExpiry > now) return false;
    this.expiresByKey.set(key, now + this.ttlMs);
    for (const [storedKey, expiresAt] of this.expiresByKey) {
      if (expiresAt <= now) this.expiresByKey.delete(storedKey);
    }
    return true;
  }
}

class ResilientAlertClaimStore implements AlertClaimStore {
  constructor(
    private readonly primary: AlertClaimStore,
    private readonly fallback: AlertClaimStore
  ) {}

  async claim(key: string, now = Date.now()): Promise<boolean> {
    try {
      return await this.primary.claim(key, now);
    } catch {
      return this.fallback.claim(key, now);
    }
  }
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

export class IndexedDbAlertClaimStore implements AlertClaimStore {
  private databasePromise?: Promise<IDBDatabase>;

  constructor(
    private readonly indexedDb: IDBFactory,
    private readonly ttlMs = DEFAULT_CLAIM_TTL_MS
  ) {}

  async claim(key: string, now = Date.now()): Promise<boolean> {
    const database = await this.openDatabase();
    const transaction = database.transaction(CLAIM_STORE, "readwrite");
    const store = transaction.objectStore(CLAIM_STORE);
    const existing = await requestToPromise(
      store.get(key) as IDBRequest<StoredAlertClaim | undefined>
    );
    let claimed = false;
    if (!existing || existing.expiresAt <= now) {
      store.put({
        key,
        expiresAt: now + this.ttlMs,
      } satisfies StoredAlertClaim);
      claimed = true;
    }
    this.deleteExpiredClaims(store, now, key);
    await transactionToPromise(transaction);
    return claimed;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDb.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.objectStoreNames.contains(CLAIM_STORE)
          ? request.transaction!.objectStore(CLAIM_STORE)
          : database.createObjectStore(CLAIM_STORE, { keyPath: "key" });
        if (!store.indexNames.contains(EXPIRES_INDEX)) {
          store.createIndex(EXPIRES_INDEX, "expiresAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.databasePromise;
  }

  private deleteExpiredClaims(
    store: IDBObjectStore,
    now: number,
    currentKey: string
  ): void {
    let deleted = 0;
    const request = store
      .index(EXPIRES_INDEX)
      .openCursor(IDBKeyRange.upperBound(now));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || deleted >= MAX_EXPIRED_DELETIONS_PER_CLAIM) return;
      const value = cursor.value as StoredAlertClaim;
      if (value.key !== currentKey) {
        cursor.delete();
        deleted += 1;
      }
      cursor.continue();
    };
  }
}

export function createBrowserSingleAlertCoordinator(): SingleAlertCoordinator {
  const memoryStore = new InMemoryAlertClaimStore();
  const claimStore =
    typeof indexedDB === "undefined"
      ? memoryStore
      : new ResilientAlertClaimStore(
          new IndexedDbAlertClaimStore(indexedDB),
          memoryStore
        );
  const BrowserBroadcastChannel =
    typeof window === "undefined" ? undefined : window.BroadcastChannel;
  const channel = !BrowserBroadcastChannel
    ? undefined
    : new BrowserBroadcastChannel("octo-message-attention");
  return new SingleAlertCoordinator({ claimStore, channel });
}

let browserSingleAlertCoordinator: SingleAlertCoordinator | undefined;

export function getBrowserSingleAlertCoordinator(): SingleAlertCoordinator {
  if (!browserSingleAlertCoordinator) {
    browserSingleAlertCoordinator = createBrowserSingleAlertCoordinator();
  }
  return browserSingleAlertCoordinator;
}
