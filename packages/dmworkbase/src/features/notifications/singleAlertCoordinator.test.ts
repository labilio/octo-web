import { describe, expect, it, vi } from "vitest";
import { IDBFactory, IDBKeyRange as FakeIDBKeyRange } from "fake-indexeddb";
import {
  IndexedDbAlertClaimStore,
  SingleAlertCoordinator,
  type AlertClaimStore,
} from "./singleAlertCoordinator";

class MemoryClaimStore implements AlertClaimStore {
  private readonly keys = new Set<string>();

  async claim(key: string): Promise<boolean> {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    return true;
  }
}

describe("SingleAlertCoordinator", () => {
  it("allows one alert for the same account and message", async () => {
    const store = new MemoryClaimStore();
    const first = new SingleAlertCoordinator({ claimStore: store });
    const second = new SingleAlertCoordinator({ claimStore: store });
    const alert = vi.fn();

    await Promise.all([
      first.runOnce({ accountId: "u1", messageId: "m1", alert }),
      second.runOnce({ accountId: "u1", messageId: "m1", alert }),
    ]);

    expect(alert).toHaveBeenCalledTimes(1);
  });

  it("falls back to clientMsgNo and keeps accounts isolated", async () => {
    const store = new MemoryClaimStore();
    const coordinator = new SingleAlertCoordinator({ claimStore: store });
    const alert = vi.fn();

    await coordinator.runOnce({ accountId: "u1", clientMsgNo: "c1", alert });
    await coordinator.runOnce({ accountId: "u2", clientMsgNo: "c1", alert });

    expect(alert).toHaveBeenCalledTimes(2);
  });

  it("does not claim messages without a stable id", async () => {
    const coordinator = new SingleAlertCoordinator({
      claimStore: new MemoryClaimStore(),
    });
    const alert = vi.fn();

    expect(await coordinator.runOnce({ accountId: "u1", alert })).toBe(false);
    expect(alert).not.toHaveBeenCalled();
  });

  it("lets a visible tab claim without alerting so background tabs stay silent", async () => {
    const store = new MemoryClaimStore();
    const visibleTab = new SingleAlertCoordinator({ claimStore: store });
    const backgroundTab = new SingleAlertCoordinator({ claimStore: store });
    const alert = vi.fn();

    expect(
      await visibleTab.claimOnly({ accountId: "u1", messageId: "m1" })
    ).toBe(true);
    expect(
      await backgroundTab.runOnce({ accountId: "u1", messageId: "m1", alert })
    ).toBe(false);
    expect(alert).not.toHaveBeenCalled();
  });

  it("atomically grants one claim across independent IndexedDB-backed tabs", async () => {
    vi.stubGlobal("IDBKeyRange", FakeIDBKeyRange);
    const indexedDb = new IDBFactory();
    const firstTab = new IndexedDbAlertClaimStore(indexedDb);
    const secondTab = new IndexedDbAlertClaimStore(indexedDb);

    const results = await Promise.all([
      firstTab.claim("same-account-and-message"),
      secondTab.claim("same-account-and-message"),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });
});
