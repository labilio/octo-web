import WKApp from "../App";
import { apiFetchJson } from "./apiFetch";

export type ClientPlatform = "android" | "ios";

const UPDATER_PATHS: Record<ClientPlatform, string> = {
  android: "common/updater/android/1.0",
  ios: "common/updater/ios/1.0.0",
};

export function resolveSafeDistributionUrl(value: unknown, baseUrl: string) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim(), baseUrl);
    if (url.protocol === "http:" || url.protocol === "https:")
      return url.toString();
  } catch {
    // An invalid updater payload is handled as an unavailable download.
  }
  return undefined;
}

type DistributionFetcher = (url: string) => Promise<{ url?: unknown }>;

export class ClientDistributionService {
  constructor(
    private readonly fetchJson: DistributionFetcher = (url) =>
      apiFetchJson<{ url?: unknown }>(url),
    private readonly getApiUrl: () => string = () =>
      WKApp.apiClient.config.apiURL
  ) {}

  resolveUpdaterUrl(platform: ClientPlatform) {
    return `${this.getApiUrl().replace(/\/?$/, "/")}${UPDATER_PATHS[platform]}`;
  }

  async getDownloadUrl(platform: ClientPlatform) {
    const result = await this.fetchJson(this.resolveUpdaterUrl(platform));
    const url = resolveSafeDistributionUrl(result?.url, this.getApiUrl());
    if (!url) throw new Error("Updater returned an invalid download URL");
    return url;
  }

  static shared = new ClientDistributionService();
}

export default ClientDistributionService;
