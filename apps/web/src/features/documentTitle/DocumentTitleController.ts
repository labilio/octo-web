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
}

export class DocumentTitleController {
  private readonly options: DocumentTitleControllerOptions;
  private unsubscribers: Array<() => void> = [];
  private started = false;

  constructor(options: DocumentTitleControllerOptions) {
    this.options = options;
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.unsubscribers = [
      this.options.contexts.subscribe(this.render),
      this.options.subscribeActiveMenu(this.render),
      this.options.subscribeUnreadChanges(this.render),
    ];
    this.render();
  }

  stop(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.unsubscribers = [];
    this.started = false;
  }

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
