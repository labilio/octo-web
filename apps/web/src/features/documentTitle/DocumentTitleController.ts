import { buildDocumentTitle, type TitleContextStore } from "@octo/base";

export interface ActiveMenuTitle {
  id: string;
  title: string;
}

export function resolveTitleMenuId(
  pathname: string,
  currentMenuId?: string
): string | undefined {
  if (/^\/s\/(?:share\/)?[^/]+\/?$/.test(pathname)) return "summary";
  if (/^\/d\/[^/]+\/?$/.test(pathname)) return "docs";
  return currentMenuId || undefined;
}

interface DocumentTitleTarget {
  title: string;
}

export interface DocumentTitleControllerOptions {
  target: DocumentTitleTarget;
  contexts: TitleContextStore;
  getActiveMenu: () => ActiveMenuTitle | undefined;
  getUnreadConversationCount: () => number;
  subscribeActiveMenu: (listener: () => void) => () => void;
  subscribeUnreadChanges: (listener: () => void) => () => void;
  restoreUnreadState?: () => Promise<void> | void;
}

export class DocumentTitleController {
  private readonly options: DocumentTitleControllerOptions;
  private unsubscribers: Array<() => void> = [];
  private started = false;
  private renderScheduled = false;
  private lifecycleGeneration = 0;

  constructor(options: DocumentTitleControllerOptions) {
    this.options = options;
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.lifecycleGeneration += 1;
    this.unsubscribers = [
      this.options.contexts.subscribe(this.invalidate),
      this.options.subscribeActiveMenu(this.invalidate),
      this.options.subscribeUnreadChanges(this.invalidate),
    ];
    this.render();
    const generation = this.lifecycleGeneration;
    let restoration: Promise<void> | void;
    try {
      restoration = this.options.restoreUnreadState?.();
    } catch {
      return;
    }
    void Promise.resolve(restoration)
      .then(() => {
        if (generation !== this.lifecycleGeneration || !this.started) return;
        this.invalidate();
      })
      .catch(() => undefined);
  }

  stop(): void {
    this.started = false;
    this.lifecycleGeneration += 1;
    this.renderScheduled = false;
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.unsubscribers = [];
  }

  private invalidate = (): void => {
    if (!this.started || this.renderScheduled) return;
    this.renderScheduled = true;
    const generation = this.lifecycleGeneration;
    queueMicrotask(() => {
      if (generation !== this.lifecycleGeneration) return;
      this.renderScheduled = false;
      if (!this.started) return;
      this.render();
    });
  };

  private render = (): void => {
    const activeMenu = this.options.getActiveMenu();
    const nextTitle = buildDocumentTitle({
      unreadConversationCount: this.options.getUnreadConversationCount(),
      context: activeMenu
        ? this.options.contexts.get(activeMenu.id)
        : undefined,
      fallbackTitle: activeMenu?.title,
    });
    if (this.options.target.title !== nextTitle) {
      this.options.target.title = nextTitle;
    }
  };
}
