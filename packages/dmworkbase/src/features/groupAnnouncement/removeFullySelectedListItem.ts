import { Extension, type Editor } from "@tiptap/core";

function deleteFullySelectedListItem(editor: Editor): boolean {
  const { selection } = editor.state;
  if (selection.empty) {
    return false;
  }

  const { $from, $to } = selection;
  let listItemDepth = -1;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem") {
      listItemDepth = depth;
      break;
    }
  }

  if (
    listItemDepth < 1 ||
    $to.depth < listItemDepth ||
    $to.node(listItemDepth) !== $from.node(listItemDepth)
  ) {
    return false;
  }

  const listItem = $from.node(listItemDepth);
  const listItemStart = $from.before(listItemDepth);
  let firstTextPosition: number | undefined;
  let lastTextPosition: number | undefined;

  listItem.descendants((node, relativePosition) => {
    if (!node.isText) {
      return;
    }
    const absolutePosition = listItemStart + 1 + relativePosition;
    firstTextPosition ??= absolutePosition;
    lastTextPosition = absolutePosition + node.nodeSize;
  });

  if (
    firstTextPosition === undefined ||
    lastTextPosition === undefined ||
    selection.from > firstTextPosition ||
    selection.to < lastTextPosition
  ) {
    return false;
  }

  const transaction = editor.state.tr.delete(
    listItemStart,
    listItemStart + listItem.nodeSize
  );
  editor.view.dispatch(transaction);
  return true;
}

export const RemoveFullySelectedListItem = Extension.create({
  name: "removeFullySelectedListItem",
  priority: 1100,

  addKeyboardShortcuts() {
    return {
      Backspace: () => deleteFullySelectedListItem(this.editor),
      Delete: () => deleteFullySelectedListItem(this.editor),
    };
  },
});
