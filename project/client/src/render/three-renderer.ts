import * as THREE from 'three';

import {
  clampPixelRatio,
  isRenderableSize,
  normalizeRenderSize,
  sizeFromRect,
  type RenderSize,
} from './render-sizing';

export type ThreeRendererOptions = {
  maxPixelRatio?: number;
  clearColor?: number;
};

export type ThreeRendererRuntime = {
  start: () => void;
  stop: () => void;
  resizeToContainer: () => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

export function createThreeRenderer(
  containerEl: HTMLElement,
  options: ThreeRendererOptions = {},
): ThreeRendererRuntime {
  const maxPixelRatio = options.maxPixelRatio ?? 2;
  const clearColor = options.clearColor ?? 0x070b16;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(clearColor);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 6, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(clearColor, 1);
  renderer.setPixelRatio(clampPixelRatio(window.devicePixelRatio ?? 1, maxPixelRatio));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  containerEl.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(4, 8, 2);
  scene.add(dir);

  const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1f2937);
  scene.add(grid);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x44aa88,
    metalness: 0.2,
    roughness: 0.6,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 0.5;
  scene.add(cube);

  let currentSize: RenderSize = { width: 0, height: 0 };
  let desiredRunning = false;
  let rafId: number | null = null;
  let lastTimestampMs = 0;

  let resizeObserver: ResizeObserver | null = null;
  let onWindowResize: (() => void) | null = null;

  function setSize(size: RenderSize): void {
    currentSize = size;
    if (!isRenderableSize(size)) return;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height, false);
    renderer.setPixelRatio(clampPixelRatio(window.devicePixelRatio ?? 1, maxPixelRatio));
  }

  function resize(width: number, height: number): void {
    setSize(normalizeRenderSize(width, height));
    maybeStartLoop();
  }

  function resizeToContainer(): void {
    const rect = containerEl.getBoundingClientRect();
    setSize(sizeFromRect(rect));
    maybeStartLoop();
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function frame(timestampMs: number): void {
    if (!desiredRunning) {
      stopLoop();
      return;
    }

    if (!isRenderableSize(currentSize)) {
      stopLoop();
      return;
    }

    rafId = requestAnimationFrame(frame);

    const deltaMs = timestampMs - lastTimestampMs;
    lastTimestampMs = timestampMs;

    cube.rotation.y += deltaMs * 0.001;
    cube.rotation.x += deltaMs * 0.0006;

    renderer.render(scene, camera);
  }

  function maybeStartLoop(): void {
    if (!desiredRunning) return;
    if (!isRenderableSize(currentSize)) return;
    if (rafId !== null) return;

    lastTimestampMs = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function start(): void {
    desiredRunning = true;
    resizeToContainer();
    maybeStartLoop();
  }

  function stop(): void {
    desiredRunning = false;
    stopLoop();
  }

  // Resize handling
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      resizeToContainer();
    });
    resizeObserver.observe(containerEl);
  } else {
    onWindowResize = () => resizeToContainer();
    window.addEventListener('resize', onWindowResize);
  }

  function dispose(): void {
    stop();

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (onWindowResize) {
      window.removeEventListener('resize', onWindowResize);
      onWindowResize = null;
    }

    grid.geometry.dispose();
    if (Array.isArray(grid.material)) {
      for (const material of grid.material) material.dispose();
    } else {
      grid.material.dispose();
    }

    cubeGeometry.dispose();
    cubeMaterial.dispose();
    renderer.dispose();

    const canvas = renderer.domElement;
    if (canvas.parentElement === containerEl) {
      containerEl.removeChild(canvas);
    }
  }

  return { start, stop, resizeToContainer, resize, dispose };
}
