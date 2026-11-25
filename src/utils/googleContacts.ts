export interface GoogleContactCustomer {
    _id?: string;
    customerName?: string;
    customerPhone?: string;
    productType?: string;
    products?: string;
    selectedGift?: string;
    status?: string;
}

export interface GoogleContactsSyncResult {
    totalCandidates: number;
    createdCount: number;
    skippedDuplicateCount: number;
    failedCount: number;
    syncedCustomerIds: string[];
}

export interface GoogleContactsSyncOptions {
    onProgress?: (message: string) => void;
    loginHint?: string;
    forceAccountSelect?: boolean;
}

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const CONTACTS_SCOPE = "https://www.googleapis.com/auth/contacts";
const TOKEN_STORAGE_KEY = "sono_google_contacts_token_v1";
const CONTACTS_CACHE_PREFIX = "sono_google_contacts_cache_v1_";

interface CachedTokenData {
    token: string;
    expiresAt: number;
    clientId: string;
    loginHint?: string;
    accountKey?: string;
}

interface ContactsSyncCache {
    syncToken: string;
    /** resourceName -> normalized phone numbers */
    contacts: Record<string, string[]>;
    updatedAt: number;
}

let cachedToken: CachedTokenData | null = null;
let gisLoadPromise: Promise<void> | null = null;
const memoryContactsCache = new Map<string, ContactsSyncCache>();

function loadStoredToken(clientId: string, loginHint?: string): CachedTokenData | null {
    const normHint = (loginHint || "").trim().toLowerCase();
    if (
        cachedToken &&
        cachedToken.clientId === clientId &&
        (cachedToken.loginHint || "").trim().toLowerCase() === normHint &&
        cachedToken.expiresAt > Date.now() + 60_000
    ) {
        return cachedToken;
    }
    try {
        const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedTokenData;
        if (
            parsed?.clientId === clientId &&
            (parsed.loginHint || "").trim().toLowerCase() === normHint &&
            parsed?.token &&
            parsed?.expiresAt > Date.now() + 60_000
        ) {
            cachedToken = parsed;
            return parsed;
        }
    } catch {
        // ignore storage errors
    }
    return null;
}

export function clearGoogleContactsToken(): void {
    saveStoredToken(null);
}

function saveStoredToken(data: CachedTokenData | null): void {
    cachedToken = data;
    try {
        if (data) {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
        } else {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    } catch {
        // ignore storage errors
    }
}

function loadContactsCache(accountKey: string): ContactsSyncCache | null {
    const mem = memoryContactsCache.get(accountKey);
    if (mem) return mem;
    try {
        const raw = localStorage.getItem(`${CONTACTS_CACHE_PREFIX}${accountKey}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ContactsSyncCache;
        if (
            parsed &&
            typeof parsed.syncToken === "string" &&
            parsed.contacts &&
            typeof parsed.contacts === "object"
        ) {
            memoryContactsCache.set(accountKey, parsed);
            return parsed;
        }
    } catch {
        // ignore storage errors
    }
    return null;
}

function saveContactsCache(accountKey: string, cache: ContactsSyncCache): void {
    memoryContactsCache.set(accountKey, cache);
    try {
        localStorage.setItem(`${CONTACTS_CACHE_PREFIX}${accountKey}`, JSON.stringify(cache));
    } catch {
        // QuotaExceededError 등 발생 시 메모리 캐시만 유지
    }
}

function clearContactsCache(accountKey: string): void {
    memoryContactsCache.delete(accountKey);
    try {
        localStorage.removeItem(`${CONTACTS_CACHE_PREFIX}${accountKey}`);
    } catch {
        // ignore
    }
}

function loadGoogleIdentityScript(): Promise<void> {
    if ((window as any).google?.accounts?.oauth2) {
        return Promise.resolve();
    }
    if (gisLoadPromise) return gisLoadPromise;

    gisLoadPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () =>
                reject(new Error("Google 인증 스크립트를 불러오지 못했습니다."))
            );
            return;
        }
        const script = document.createElement("script");
        script.src = GIS_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error("Google 인증 스크립트를 불러오지 못했습니다."));
        document.head.appendChild(script);
    });

    return gisLoadPromise;
}

export function getCachedGoogleContactPhones(): Set<string> {
    const phones = new Set<string>();
    for (const cache of memoryContactsCache.values()) {
        for (const list of Object.values(cache.contacts)) {
            for (const p of list) {
                phones.add(p);
            }
        }
    }
    try {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(CONTACTS_CACHE_PREFIX)) continue;
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw) as ContactsSyncCache;
            if (parsed?.contacts && typeof parsed.contacts === "object") {
                for (const list of Object.values(parsed.contacts)) {
                    if (Array.isArray(list)) {
                        for (const p of list) {
                            phones.add(p);
                        }
                    }
                }
            }
        }
    } catch {
        // ignore storage errors
    }
    return phones;
}

export function normalizeKoreanPhone(raw: string): string {
    const digits = (raw || "").replace(/[^0-9]/g, "");
    if (digits.startsWith("82") && digits.length >= 11) {
        return `0${digits.slice(2)}`;
    }
    return digits;
}

function formatKoreanPhone(raw: string): string {
    const digits = normalizeKoreanPhone(raw);
    if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        if (digits.startsWith("02")) {
            return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return raw.trim();
}

async function requestGoogleContactsToken(
    clientId: string,
    loginHint?: string,
    forceAccountSelect?: boolean
): Promise<CachedTokenData> {
    if (!forceAccountSelect) {
        const stored = loadStoredToken(clientId, loginHint);
        if (stored) {
            return stored;
        }
    }

    await loadGoogleIdentityScript();
    const oauth2 = (window as any).google?.accounts?.oauth2;
    if (!oauth2) {
        throw new Error("Google OAuth 모듈을 초기화할 수 없습니다.");
    }

    const trimmedHint = (loginHint || "").trim();

    return new Promise<CachedTokenData>((resolve, reject) => {
        const tokenClient = oauth2.initTokenClient({
            client_id: clientId,
            scope: CONTACTS_SCOPE,
            ...(trimmedHint ? { hint: trimmedHint } : {}),
            callback: (resp: any) => {
                if (resp?.error) {
                    reject(
                        new Error(
                            resp.error_description || resp.error || "구글 로그인에 실패했습니다."
                        )
                    );
                    return;
                }
                if (!resp?.access_token) {
                    reject(new Error("구글 인증 토큰을 받지 못했습니다."));
                    return;
                }
                const expiresInSec = Number(resp.expires_in || 3500);
                const tokenData: CachedTokenData = {
                    token: resp.access_token,
                    expiresAt: Date.now() + expiresInSec * 1000,
                    clientId,
                    loginHint: trimmedHint || undefined,
                };
                saveStoredToken(tokenData);
                resolve(tokenData);
            },
            error_callback: (err: any) => {
                reject(
                    new Error(err?.message || "구글 로그인 창이 닫혔거나 차단되었습니다.")
                );
            },
        });
        tokenClient.requestAccessToken({
            prompt: "select_account",
            ...(trimmedHint ? { hint: trimmedHint } : {}),
        });
    });
}

async function resolveAccountKey(tokenData: CachedTokenData): Promise<string> {
    if (tokenData.accountKey) return tokenData.accountKey;

    try {
        const res = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=metadata",
            {
                headers: { Authorization: `Bearer ${tokenData.token}` },
            }
        );
        if (res.status === 401) {
            saveStoredToken(null);
            throw new Error("구글 인증이 만료되었습니다. 다시 시도해주세요.");
        }
        if (res.ok) {
            const data = await res.json();
            if (typeof data?.resourceName === "string" && data.resourceName.length > 0) {
                const key = data.resourceName.replace(/[^a-zA-Z0-9_-]/g, "_");
                tokenData.accountKey = key;
                saveStoredToken(tokenData);
                return key;
            }
        }
    } catch (err: any) {
        if (err?.message?.includes("만료")) throw err;
    }

    return tokenData.clientId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extractNormalizedPhones(person: any): string[] {
    const phones = Array.isArray(person?.phoneNumbers) ? person.phoneNumbers : [];
    const result: string[] = [];
    for (const p of phones) {
        const norm = normalizeKoreanPhone(p?.value || p?.canonicalForm || "");
        if (norm.length >= 9 && !result.includes(norm)) {
            result.push(norm);
        }
    }
    return result;
}

async function runConnectionsSync(
    accessToken: string,
    accountKey: string,
    existingCache: ContactsSyncCache | null,
    onProgress?: (message: string) => void
): Promise<ContactsSyncCache> {
    const contacts: Record<string, string[]> = existingCache
        ? { ...existingCache.contacts }
        : {};
    let pageToken = "";
    let nextSyncToken = existingCache?.syncToken || "";
    let fetchedCount = 0;
    const isIncremental = Boolean(existingCache?.syncToken);

    for (let page = 0; page < 30; page += 1) {
        const url = new URL("https://people.googleapis.com/v1/people/me/connections");
        url.searchParams.set("personFields", "phoneNumbers,metadata");
        url.searchParams.set("pageSize", "1000");
        url.searchParams.set("requestSyncToken", "true");
        if (isIncremental && existingCache?.syncToken) {
            url.searchParams.set("syncToken", existingCache.syncToken);
        }
        if (pageToken) {
            url.searchParams.set("pageToken", pageToken);
        }

        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.status === 401) {
            saveStoredToken(null);
            throw new Error("구글 인증이 만료되었습니다. 다시 시도해주세요.");
        }

        if (res.status === 410 && isIncremental) {
            clearContactsCache(accountKey);
            return runConnectionsSync(accessToken, accountKey, null, onProgress);
        }

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const msg = errBody?.error?.message || `Google People API 오류 (${res.status})`;
            throw new Error(msg);
        }

        const data = await res.json();
        const connections = Array.isArray(data?.connections) ? data.connections : [];
        fetchedCount += connections.length;

        for (const person of connections) {
            const resourceName = person?.resourceName;
            if (!resourceName) continue;
            if (person?.metadata?.deleted) {
                delete contacts[resourceName];
            } else {
                const norms = extractNormalizedPhones(person);
                if (norms.length > 0) {
                    contacts[resourceName] = norms;
                } else {
                    delete contacts[resourceName];
                }
            }
        }

        if (data?.nextSyncToken) {
            nextSyncToken = data.nextSyncToken;
        }

        if (!isIncremental && connections.length > 0) {
            onProgress?.(`기존 주소록 불러오는 중... (${fetchedCount.toLocaleString()}건)`);
        }

        if (!data?.nextPageToken) break;
        pageToken = data.nextPageToken;
    }

    const updatedCache: ContactsSyncCache = {
        syncToken: nextSyncToken,
        contacts,
        updatedAt: Date.now(),
    };
    if (nextSyncToken) {
        saveContactsCache(accountKey, updatedCache);
    }
    return updatedCache;
}

async function fetchExistingPhoneCache(
    tokenData: CachedTokenData,
    onProgress?: (message: string) => void
): Promise<{ accountKey: string; cache: ContactsSyncCache; phoneSet: Set<string> }> {
    const accountKey = await resolveAccountKey(tokenData);
    const existingCache = loadContactsCache(accountKey);

    onProgress?.(existingCache ? "주소록 변경사항 확인 중..." : "기존 주소록 불러오는 중...");
    const syncedCache = await runConnectionsSync(
        tokenData.token,
        accountKey,
        existingCache,
        onProgress
    );

    const phoneSet = new Set<string>();
    for (const phones of Object.values(syncedCache.contacts)) {
        for (const p of phones) {
            phoneSet.add(p);
        }
    }

    return { accountKey, cache: syncedCache, phoneSet };
}

export async function syncCustomersToGoogleContacts(
    customers: GoogleContactCustomer[],
    clientId: string,
    options?: GoogleContactsSyncOptions
): Promise<GoogleContactsSyncResult> {
    const trimmedClientId = clientId.trim();
    if (!trimmedClientId) {
        throw new Error("Google OAuth 클라이언트 ID가 설정되지 않았습니다.");
    }

    const onProgress = options?.onProgress;

    const uniqueMap = new Map<string, GoogleContactCustomer>();
    for (const c of customers) {
        const norm = normalizeKoreanPhone(c.customerPhone || "");
        if (norm.length < 9) continue;
        if (!uniqueMap.has(norm)) {
            uniqueMap.set(norm, c);
        }
    }

    const uniqueCustomers = Array.from(uniqueMap.entries());
    if (uniqueCustomers.length === 0) {
        return {
            totalCandidates: 0,
            createdCount: 0,
            skippedDuplicateCount: 0,
            failedCount: 0,
            syncedCustomerIds: [],
        };
    }

    onProgress?.("구글 로그인 확인 중...");
    const tokenData = await requestGoogleContactsToken(
        trimmedClientId,
        options?.loginHint,
        options?.forceAccountSelect
    );
    const { accountKey, cache, phoneSet: existingPhones } = await fetchExistingPhoneCache(
        tokenData,
        onProgress
    );

    const toCreate: Array<{ normPhone: string; customer: GoogleContactCustomer }> = [];
    let skippedDuplicateCount = 0;

    for (const [normPhone, customer] of uniqueCustomers) {
        if (existingPhones.has(normPhone)) {
            skippedDuplicateCount += 1;
        } else {
            toCreate.push({ normPhone, customer });
        }
    }

    let createdCount = 0;
    let failedCount = 0;

    for (let i = 0; i < toCreate.length; i += 200) {
        const chunk = toCreate.slice(i, i + 200);
        onProgress?.(
            `구글 주소록 등록 중... (${Math.min(i + chunk.length, toCreate.length)}/${toCreate.length}명)`
        );

        const contactsPayload = chunk.map(({ customer: c }) => {
            const baseName = (c.customerName || "고객").trim() || "고객";
            const contactName = baseName.includes("(소노)") ? baseName : `${baseName}(소노)`;
            const formattedPhone = formatKoreanPhone(c.customerPhone || "");
            const noteParts = [c.productType, c.products, c.selectedGift, c.status].filter(
                (v) => typeof v === "string" && v.trim().length > 0
            );

            return {
                contactPerson: {
                    names: [{ givenName: contactName }],
                    phoneNumbers: [{ value: formattedPhone, type: "mobile" }],
                    organizations: [{ name: "소노아임레디 고객" }],
                    ...(noteParts.length > 0
                        ? {
                              biographies: [
                                  { value: noteParts.join(" / "), contentType: "TEXT_PLAIN" },
                              ],
                          }
                        : {}),
                },
            };
        });

        const res = await fetch("https://people.googleapis.com/v1/people:batchCreateContacts", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenData.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contacts: contactsPayload,
                readMask: "metadata",
            }),
        });

        if (res.status === 401) {
            saveStoredToken(null);
            throw new Error("구글 인증이 만료되었습니다. 다시 시도해주세요.");
        }

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const msg = errBody?.error?.message || `구글 주소록 등록 오류 (${res.status})`;
            throw new Error(msg);
        }

        const result = await res.json();
        const createdList = Array.isArray(result?.createdPeople) ? result.createdPeople : [];
        createdList.forEach((item: any, idx: number) => {
            if (item?.httpStatusCode && item.httpStatusCode >= 400) {
                failedCount += 1;
            } else {
                createdCount += 1;
                const normPhone = chunk[idx]?.normPhone;
                const resourceName = item?.person?.resourceName;
                if (normPhone && resourceName) {
                    cache.contacts[resourceName] = [normPhone];
                    existingPhones.add(normPhone);
                }
            }
        });
    }

    if (createdCount > 0 && cache.syncToken) {
        cache.updatedAt = Date.now();
        saveContactsCache(accountKey, cache);
    }

    const syncedCustomerIds: string[] = [];
    for (const c of customers) {
        if (!c._id) continue;
        const norm = normalizeKoreanPhone(c.customerPhone || "");
        if (norm.length >= 9 && existingPhones.has(norm)) {
            syncedCustomerIds.push(c._id);
        }
    }

    return {
        totalCandidates: uniqueCustomers.length,
        createdCount,
        skippedDuplicateCount,
        failedCount,
        syncedCustomerIds,
    };
}

export async function syncSingleCustomerWithPrompt(
    customer: GoogleContactCustomer,
    clientId: string,
    loginHint?: string
): Promise<boolean> {
    if (!clientId) {
        alert(
            "Google OAuth 클라이언트 ID가 아직 설정되지 않았습니다.\n환경설정 > 문자(SMS) 관리 > [구글 주소록 자동 등록 연동]에 클라이언트 ID를 먼저 입력해주세요."
        );
        return false;
    }

    const normPhone = normalizeKoreanPhone(customer.customerPhone || "");
    if (normPhone.length < 9) {
        alert("유효한 연락처가 없어 구글 주소록에 등록할 수 없습니다.");
        return false;
    }

    const displayName = (customer.customerName || "고객").trim() || "고객";
    const displayPhone = formatKoreanPhone(customer.customerPhone || "");

    if (
        !confirm(
            `${displayName} (${displayPhone})님을 구글 주소록에 등록하시겠습니까?\n(이미 등록된 번호는 자동으로 건너뜁니다)`
        )
    ) {
        return false;
    }

    try {
        const res = await syncCustomersToGoogleContacts([customer], clientId, { loginHint });
        if (res.createdCount > 0) {
            alert(
                `${displayName}님이 구글 주소록에 등록되었습니다!\n잠시 후 회사폰 연락처에 자동으로 반영됩니다.`
            );
            return true;
        } else if (res.skippedDuplicateCount > 0) {
            alert(`${displayName} (${displayPhone})님은 이미 구글 주소록에 등록되어 있습니다.`);
            return true;
        } else if (res.failedCount > 0) {
            alert("구글 주소록 등록에 실패했습니다.");
            return false;
        } else {
            alert("등록할 수 있는 유효한 연락처가 없습니다.");
            return false;
        }
    } catch (err: any) {
        alert(`구글 주소록 등록 실패: ${err?.message || "알 수 없는 오류"}`);
        return false;
    }
}
