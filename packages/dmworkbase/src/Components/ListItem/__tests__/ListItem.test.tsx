import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListItemMuliteLine } from "../index";

describe("ListItemMuliteLine", () => {
  it("renders a truncated multiline subtitle without crashing", () => {
    render(
      <ListItemMuliteLine
        style={{}}
        title="群公告"
        subTitle="【重要通知】群公告验收"
        truncateSubtitle
      />
    );

    expect(screen.getByText("【重要通知】群公告验收")).toHaveClass(
      "wk-list-item-subtitle-oneline"
    );
  });
});
