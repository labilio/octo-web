import { describe, expect, it, vi } from "vitest";

vi.mock("../../App", () => ({
  default: { apiClient: { config: { apiURL: "https://im.example.com/api/" } } },
}));

vi.mock("../apiFetch", () => ({ apiFetchJson: vi.fn() }));

import {
  ClientDistributionService,
  resolveSafeDistributionUrl,
} from "../ClientDistributionService";

describe("ClientDistributionService", () => {
  it("accepts only http and https download URLs", () => {
    expect(
      resolveSafeDistributionUrl(
        "https://example.com/octo.apk",
        "https://im.example.com"
      )
    ).toBe("https://example.com/octo.apk");
    expect(
      resolveSafeDistributionUrl(
        "/downloads/octo.apk",
        "https://im.example.com"
      )
    ).toBe("https://im.example.com/downloads/octo.apk");
    expect(
      resolveSafeDistributionUrl(
        "javascript:alert(1)",
        "https://im.example.com"
      )
    ).toBeUndefined();
  });

  it("loads a platform updater endpoint through the injected client", async () => {
    const fetchJson = vi
      .fn()
      .mockResolvedValue({ url: "https://example.com/octo.apk" });
    const service = new ClientDistributionService(
      fetchJson,
      () => "https://im.example.com/api"
    );
    await expect(service.getDownloadUrl("android")).resolves.toBe(
      "https://example.com/octo.apk"
    );
    expect(fetchJson).toHaveBeenCalledWith(
      "https://im.example.com/api/common/updater/android/1.0"
    );
  });
});
