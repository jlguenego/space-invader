import * as THREE from 'three';

export type WebglProbeResult = { ok: true } | { ok: false; message: string };

export function probeWebgl(containerEl: HTMLElement): WebglProbeResult {
  try {
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(1, 1, false);
    containerEl.appendChild(renderer.domElement);

    // Touch the context to fail early in some cases.
    void renderer.getContext();

    renderer.dispose();
    renderer.domElement.remove();

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'WebGL init failed';
    return { ok: false, message };
  }
}
