import { uiCardStyle, uiColors } from './ui-kit';

export type KeyboardControl = {
  action: string;
  keys: string;
};

export const keyboardControls = [
  { action: 'Déplacement', keys: 'flèches ou WASD' },
  { action: 'Tir', keys: 'espace' },
  { action: 'Pause', keys: 'P' },
  { action: 'Mute', keys: 'M' },
] as const satisfies ReadonlyArray<KeyboardControl>;

export function ControlsPanel(props: { title?: string }): JSX.Element {
  const title = props.title ?? 'Contrôles (desktop)';

  return (
    <section style={uiCardStyle}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      <ul style={{ margin: '10px 0 0', color: uiColors.muted }}>
        {keyboardControls.map((c) => (
          <li key={c.action}>
            {c.action} : <strong style={{ color: uiColors.text }}>{c.keys}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
