import * as THREE from 'three';

import type { World } from '../game/world-types';

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
  getWorld?: () => World;
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
  const getWorld = options.getWorld;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(clearColor);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 10, 18);
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

  const shipGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.2);
  const shipMaterial = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    metalness: 0.1,
    roughness: 0.6,
  });
  const shipMesh = new THREE.Mesh(shipGeometry, shipMaterial);
  shipMesh.position.set(0, 0.25, 10);
  scene.add(shipMesh);

  const enemyGeometry = new THREE.BoxGeometry(1.4, 0.5, 0.9);
  const enemyMaterial = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    metalness: 0.05,
    roughness: 0.7,
  });

  const bulletGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.55);
  const bulletMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.0,
    roughness: 0.9,
  });

  const enemyMeshes = new Map<string, THREE.Mesh>();
  const bulletMeshes = new Map<string, THREE.Mesh>();

  let currentSize: RenderSize = { width: 0, height: 0 };
  let desiredRunning = false;
  let rafId: number | null = null;

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

    void timestampMs;

    if (getWorld) {
      const world = getWorld();

      shipMesh.visible = true;
      shipMesh.position.set(world.ship.pos.x, 0.25, world.ship.pos.z);

      const aliveEnemyIds = new Set<string>();
      for (const enemy of world.enemies) {
        if (!enemy.alive) continue;
        aliveEnemyIds.add(enemy.id);

        let mesh = enemyMeshes.get(enemy.id);
        if (!mesh) {
          mesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
          enemyMeshes.set(enemy.id, mesh);
          scene.add(mesh);
        }
        mesh.position.set(enemy.pos.x, 0.25, enemy.pos.z);
      }

      for (const [id, mesh] of enemyMeshes) {
        if (aliveEnemyIds.has(id)) continue;
        scene.remove(mesh);
        enemyMeshes.delete(id);
      }

      const aliveBulletIds = new Set<string>();
      for (const bullet of world.bullets) {
        if (!bullet.alive) continue;
        aliveBulletIds.add(bullet.id);

        let mesh = bulletMeshes.get(bullet.id);
        if (!mesh) {
          mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
          bulletMeshes.set(bullet.id, mesh);
          scene.add(mesh);
        }
        mesh.position.set(bullet.pos.x, 0.3, bullet.pos.z);
      }

      for (const [id, mesh] of bulletMeshes) {
        if (aliveBulletIds.has(id)) continue;
        scene.remove(mesh);
        bulletMeshes.delete(id);
      }
    } else {
      shipMesh.visible = false;
    }

    renderer.render(scene, camera);
  }

  function maybeStartLoop(): void {
    if (!desiredRunning) return;
    if (!isRenderableSize(currentSize)) return;
    if (rafId !== null) return;

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

    for (const mesh of enemyMeshes.values()) scene.remove(mesh);
    for (const mesh of bulletMeshes.values()) scene.remove(mesh);
    enemyMeshes.clear();
    bulletMeshes.clear();

    shipGeometry.dispose();
    shipMaterial.dispose();
    enemyGeometry.dispose();
    enemyMaterial.dispose();
    bulletGeometry.dispose();
    bulletMaterial.dispose();
    renderer.dispose();

    const canvas = renderer.domElement;
    if (canvas.parentElement === containerEl) {
      containerEl.removeChild(canvas);
    }
  }

  return { start, stop, resizeToContainer, resize, dispose };
}
