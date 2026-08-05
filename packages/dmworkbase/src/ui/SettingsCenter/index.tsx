import React, { useEffect, useState } from "react";
import { Tabs } from "@douyinfe/semi-ui";
import { ChevronRight, X } from "lucide-react";
import WKModal from "../../Components/WKModal";
import "./settings-center.css";

export interface SettingsCenterCategory {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SettingsCenterViewProps {
  visible: boolean;
  title: React.ReactNode;
  closeLabel: string;
  activeKey: string;
  categories: SettingsCenterCategory[];
  onActiveKeyChange: (key: string) => void;
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

function useNarrowSettingsLayout() {
  const query = "(max-width: 640px)";
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return undefined;
    const mediaQuery = window.matchMedia(query);
    const update = () => setIsNarrow(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  return isNarrow;
}

export function SettingsCenterView({
  visible,
  title,
  closeLabel,
  activeKey,
  categories,
  onActiveKeyChange,
  onClose,
  footer,
  children,
}: SettingsCenterViewProps) {
  const isNarrow = useNarrowSettingsLayout();
  return (
    <WKModal
      visible={visible}
      onCancel={onClose}
      title={null}
      footer={null}
      width={isNarrow ? "100vw" : "min(1080px, calc(100vw - var(--wk-sp-8)))"}
      options={{ closable: false, maskClosable: true, closeOnEsc: true }}
      className="wk-settings-center-modal"
    >
      <div className="wk-settings-center">
        <aside className="wk-settings-center__sidebar">
          <h1 className="wk-settings-center__title">{title}</h1>
          <Tabs
            className="wk-settings-center__tabs"
            type="button"
            tabPosition="left"
            activeKey={activeKey}
            onChange={onActiveKeyChange}
            tabList={categories.map((category) => ({
              itemKey: category.id,
              icon: category.icon,
              tab: category.label,
            }))}
          />
          {footer && <div className="wk-settings-center__footer">{footer}</div>}
        </aside>
        <main className="wk-settings-center__content">{children}</main>
        <button
          type="button"
          className="wk-settings-center__close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    </WKModal>
  );
}

export function SettingsPage({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="wk-settings-page">
      <header className="wk-settings-page__header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  children,
  unframed = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  unframed?: boolean;
}) {
  return (
    <section className="wk-settings-section">
      {(title || description) && (
        <header className="wk-settings-section__header">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </header>
      )}
      <div
        className={`wk-settings-section__rows${
          unframed ? " wk-settings-section__rows--unframed" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export interface SettingsRowProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  trailing?: React.ReactNode;
  actionLabel?: string;
  onClick?: () => void;
  danger?: boolean;
}

export function SettingsRow({
  title,
  description,
  value,
  trailing,
  actionLabel,
  onClick,
  danger,
}: SettingsRowProps) {
  const content = (
    <>
      <span className="wk-settings-row__main">
        <span className="wk-settings-row__title">{title}</span>
        {description && (
          <span className="wk-settings-row__description">{description}</span>
        )}
      </span>
      <span className="wk-settings-row__side">
        {value && <span className="wk-settings-row__value">{value}</span>}
        {trailing}
        {onClick && <ChevronRight size={18} aria-label={actionLabel} />}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={`wk-settings-row wk-settings-row--button${
          danger ? " wk-settings-row--danger" : ""
        }`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }
  return <div className="wk-settings-row">{content}</div>;
}

export function SettingsResourceCard({
  title,
  description,
  meta,
  actions,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <article className="wk-settings-resource">
      <div className="wk-settings-resource__body">
        <h3>{title}</h3>
        <p>{description}</p>
        {meta && <div className="wk-settings-resource__meta">{meta}</div>}
      </div>
      {actions && (
        <div className="wk-settings-resource__actions">{actions}</div>
      )}
    </article>
  );
}
