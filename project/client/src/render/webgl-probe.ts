import * as THREE from 'three';

export type WebglProbeFailureKind = 'unavailable' | 'init_failed';

export type WebglProbeResult =
  | { ok: true }
  | { ok: false; kind: WebglProbeFailureKind; debugMessage: string };

export function probeWebgl(containerEl: HTMLElement): WebglProbeResult {
  // Keep the signature stable (some failures depend on DOM availability in certain browsers).
  void containerEl;

  const canvas = document.createElement('canvas');
  const context =
    canvas.getContext('webgl2') ??
    canvas.getContext('webgl') ??
    canvas.getContext('experimental-webgl');

  if (!context) {
    return { ok: false, kind: 'unavailable', debugMessage: 'canvas.getContext returned null' };
  }

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      // three.js expects a WebGLRenderingContext; WebGL2 is compatible.
      context: context as unknown as WebGLRenderingContext,
      antialias: false,
      powerPreference: 'high-performance',
    });

    renderer.setSize(1, 1, false);

    // Touch the context to fail early in some cases.
    void renderer.getContext();

    renderer.dispose();

    return { ok: true };
  } catch (error) {
    const debugMessage = error instanceof Error ? error.message : 'Unknown WebGL init failure';
    return { ok: false, kind: 'init_failed', debugMessage };
  }
}
