export interface MessageAttentionState {
  chatModuleActive: boolean;
  documentVisible: boolean;
  windowFocused: boolean;
  currentConversation: boolean;
  newMessageVisible: boolean;
}

export interface ElementRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export function shouldSuppressImmediateAlert(
  state: MessageAttentionState
): boolean {
  return (
    state.chatModuleActive &&
    state.documentVisible &&
    state.windowFocused &&
    state.currentConversation &&
    state.newMessageVisible
  );
}

export function shouldMarkConversationRead(
  state: MessageAttentionState
): boolean {
  return shouldSuppressImmediateAlert(state);
}

export function isElementVisibleInViewport(
  rect: ElementRectangle,
  viewport: ViewportSize
): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < viewport.height &&
    rect.left < viewport.width
  );
}

export function isRectangleVisibleWithin(
  rect: ElementRectangle,
  containerRect: ElementRectangle
): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (containerRect.width <= 0 || containerRect.height <= 0) return false;
  return (
    rect.bottom > containerRect.top &&
    rect.right > containerRect.left &&
    rect.top < containerRect.bottom &&
    rect.left < containerRect.right
  );
}

export function isMessageElementVisible(
  messageSeq: number,
  targetDocument: Document = document
): boolean {
  const elements = targetDocument.querySelectorAll<HTMLElement>(
    `[data-message-seq="${messageSeq}"]`
  );
  for (const element of elements) {
    const style = targetDocument.defaultView?.getComputedStyle(element);
    if (style?.display === "none" || style?.visibility === "hidden") continue;
    const rect = element.getBoundingClientRect();
    const conversationViewport =
      element.closest<HTMLElement>('[id^="viewport-"]');
    if (
      conversationViewport &&
      !isRectangleVisibleWithin(
        rect,
        conversationViewport.getBoundingClientRect()
      )
    ) {
      continue;
    }
    if (
      isElementVisibleInViewport(rect, {
        width: targetDocument.defaultView?.innerWidth || 0,
        height: targetDocument.defaultView?.innerHeight || 0,
      })
    ) {
      return true;
    }
  }
  return false;
}
