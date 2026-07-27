import React, { useLayoutEffect, useRef } from "react";

import { cardMountRootClass, ResolvedCardRenderProfile } from "./renderProfile";
import { renderOctoCard } from "./sdk/renderOctoCard";
import "./index.css";
import "@mlt-org/octo-card-profile-octo-chat/theme.css";
import "@mlt-org/octo-card-profile-octo-chat/styles.css";

interface OctoCardViewProps {
  card: Record<string, unknown>;
  fallbackText?: string;
  renderProfile?: ResolvedCardRenderProfile;
}

/**
 * Shared, display-only entry point for Octo Adaptive Card rendering.
 *
 * Message type 17 keeps its protocol, trust and action handling in
 * InteractiveCardCell. Other trusted product surfaces can reuse the same card
 * renderer and styles through this component without pretending to be a type
 * 17 message.
 */
export function OctoCardView({
  card,
  fallbackText = "",
  renderProfile = "legacy",
}: OctoCardViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const target = mountRef.current;
    if (!target) {
      return;
    }
    try {
      renderOctoCard({
        card,
        target,
        onAction: () => {},
        renderProfile,
      });
    } catch {
      target.textContent = fallbackText;
    }
  }, [card, fallbackText, renderProfile]);

  return (
    <div className="wk-interactive-card">
      <div
        ref={mountRef}
        className={`${cardMountRootClass(
          renderProfile
        )} wk-interactive-card-sdk--readonly`}
      />
    </div>
  );
}
