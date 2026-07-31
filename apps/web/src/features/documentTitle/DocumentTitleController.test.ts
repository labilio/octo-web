import { describe, expect, it, vi } from "vitest";
import { TitleContextStore } from "../../../../../packages/dmworkbase/src/features/documentTitle/titleContextStore";
import {
  DocumentTitleController,
  resolveTitleMenuId,
} from "./DocumentTitleController";

vi.mock("@octo/base", async () => {
  return import(
    "../../../../../packages/dmworkbase/src/features/documentTitle"
  );
});

describe("DocumentTitleController", () => {
  it("uses the owning module for full-page summary and document routes", () => {
    expect(resolveTitleMenuId("/s/task_1", "chat")).toBe("summary");
    expect(resolveTitleMenuId("/s/share/share_1", "chat")).toBe("summary");
    expect(resolveTitleMenuId("/d/doc_1", "chat")).toBe("docs");
    expect(resolveTitleMenuId("/contacts", "contacts")).toBe("contacts");
  });

  it("renders from the active menu context and reacts without polling", () => {
    const target = { title: "Octo" };
    const store = new TitleContextStore();
    let activeMenu = { id: "chat", title: "会话" };
    let unreadCount = 2;
    const menuListeners = new Set<() => void>();
    const unreadListeners = new Set<() => void>();
    const controller = new DocumentTitleController({
      target,
      contexts: store,
      getActiveMenu: () => activeMenu,
      getUnreadConversationCount: () => unreadCount,
      subscribeActiveMenu: (listener) => {
        menuListeners.add(listener);
        return () => menuListeners.delete(listener);
      },
      subscribeUnreadChanges: (listener) => {
        unreadListeners.add(listener);
        return () => unreadListeners.delete(listener);
      },
    });

    controller.start();
    expect(target.title).toBe("(2) 会话 - Octo");

    store.set("chat", { primaryTitle: "产品群" });
    expect(target.title).toBe("(2) 产品群 - Octo");

    activeMenu = { id: "docs", title: "文档" };
    store.set("docs", { primaryTitle: "年度经营计划", moduleTitle: "文档" });
    for (const listener of menuListeners) listener();
    expect(target.title).toBe("(2) 年度经营计划 - 文档 - Octo");

    unreadCount = 0;
    for (const listener of unreadListeners) listener();
    expect(target.title).toBe("年度经营计划 - 文档 - Octo");
  });

  it("stops every subscription", () => {
    const unsubscribeMenu = vi.fn();
    const unsubscribeUnread = vi.fn();
    const contexts = new TitleContextStore();
    const unsubscribeContext = vi.spyOn(contexts, "subscribe");
    const controller = new DocumentTitleController({
      target: { title: "Octo" },
      contexts,
      getActiveMenu: () => undefined,
      getUnreadConversationCount: () => 0,
      subscribeActiveMenu: () => unsubscribeMenu,
      subscribeUnreadChanges: () => unsubscribeUnread,
    });

    controller.start();
    controller.stop();

    expect(unsubscribeMenu).toHaveBeenCalledOnce();
    expect(unsubscribeUnread).toHaveBeenCalledOnce();
    expect(unsubscribeContext).toHaveBeenCalledOnce();
  });
});
