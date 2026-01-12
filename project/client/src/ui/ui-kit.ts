import type { CSSProperties } from 'react';

export const uiColors = {
  bg: '#0b0f1a',
  panel: 'rgba(255,255,255,0.06)',
  text: '#e8eefc',
  muted: 'rgba(232,238,252,0.75)',
  border: 'rgba(232,238,252,0.18)',
  focus: '#60a5fa',
  danger: '#ff6b6b',
  success: '#22c55e',
  warning: '#f59e0b',
};

export const uiGlobalA11yCss = `
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  [tabindex]:not([tabindex="-1"]):focus-visible {
    outline: 3px solid ${uiColors.focus};
    outline-offset: 2px;
  }

  /* Keep disabled controls readable, but clearly non-interactive. */
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const uiLayout = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  maxWidth: 980,
  padding: 24,
};

export const uiCardStyle: CSSProperties = {
  background: uiColors.panel,
  border: `1px solid ${uiColors.border}`,
  borderRadius: 12,
  padding: 16,
};

export const uiButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: `1px solid ${uiColors.border}`,
  background: 'rgba(255,255,255,0.08)',
  color: uiColors.text,
  cursor: 'pointer',
};

export const uiInputStyle: CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 10,
  border: `1px solid ${uiColors.border}`,
  background: 'rgba(0,0,0,0.25)',
  color: uiColors.text,
};
