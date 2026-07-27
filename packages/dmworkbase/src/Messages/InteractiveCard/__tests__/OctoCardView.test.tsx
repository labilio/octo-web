import React from "react";
import ReactDOM from "react-dom";
import { afterEach, describe, expect, it } from "vitest";

import { OctoCardView } from "../OctoCardView";

describe("OctoCardView", () => {
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      container = undefined;
    }
  });

  it("exposes the existing Adaptive Cards renderer as a read-only shared view", () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    ReactDOM.render(
      <OctoCardView
        card={{
          type: "AdaptiveCard",
          version: "1.5",
          body: [
            {
              type: "TextBlock",
              text: "Shared card renderer",
              wrap: true,
            },
          ],
        }}
        fallbackText="fallback"
      />,
      container
    );

    expect(container.querySelector(".wk-interactive-card")).not.toBeNull();
    expect(container.querySelector(".wk-interactive-card-sdk")).not.toBeNull();
    expect(container.textContent).toContain("Shared card renderer");
  });
});
