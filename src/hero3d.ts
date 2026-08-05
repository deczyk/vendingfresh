import * as THREE from 'three';
import { loadCutoutCanvas } from './imageCutout';
import {
  HERO_TILT_MAX_DEGREES,
  HERO_ZOOM_MAX,
  HERO_Z_PARALLAX,
  MACHINE_IMAGE_SRC,
} from './heroConfig';
import { showHeroErrorPanel } from './heroError';

const BRAND_GOLD_RGB = '216, 169, 79';

const CAMERA_FOV_DEGREES = 35;
const CAMERA_DISTANCE = 6.5;
const FRAME_SAFETY_MARGIN = 0.95; // 5% headroom so zoom/parallax never clips the photo

// Plane height is derived, not hardcoded: at the closest point in the scroll
// animation (max zoom, max z-parallax), the plane must still fit inside the
// camera's vertical frustum.
const machineNearestDistance = CAMERA_DISTANCE - HERO_Z_PARALLAX;
const halfFovRadians = THREE.MathUtils.degToRad(CAMERA_FOV_DEGREES / 2);
const MACHINE_PLANE_HEIGHT =
  ((2 * machineNearestDistance * Math.tan(halfFovRadians)) / HERO_ZOOM_MAX) * FRAME_SAFETY_MARGIN;

export function initHero3D(container: HTMLElement, getScrollProgress: () => number): void {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEGREES, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(createGoldGlow());

  let machine: THREE.Mesh | null = null;

  loadCutoutCanvas(MACHINE_IMAGE_SRC)
    .then((canvas) => {
      machine = createMachinePlane(canvas);
      scene.add(machine);
    })
    .catch((error: unknown) => {
      console.warn('hero3d: nie udało się załadować zdjęcia automatu', error);
      container.hidden = true;
      showHeroErrorPanel();
    });

  function resize(): void {
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  resize();
  window.addEventListener('resize', resize);

  function animate(): void {
    requestAnimationFrame(animate);
    if (machine) {
      const progress = getScrollProgress();
      const tiltDegrees = THREE.MathUtils.lerp(
        -HERO_TILT_MAX_DEGREES,
        HERO_TILT_MAX_DEGREES,
        progress,
      );
      machine.rotation.y = THREE.MathUtils.degToRad(tiltDegrees);
      machine.scale.setScalar(THREE.MathUtils.lerp(1, HERO_ZOOM_MAX, progress));
      machine.position.z = THREE.MathUtils.lerp(0, HERO_Z_PARALLAX, progress);
    }
    renderer.render(scene, camera);
  }
  animate();
}

function createMachinePlane(canvas: HTMLCanvasElement): THREE.Mesh {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const aspect = canvas.width / canvas.height;
  const height = MACHINE_PLANE_HEIGHT;
  const width = height * aspect;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });
  return new THREE.Mesh(geometry, material);
}

function createGoldGlow(): THREE.Sprite {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${BRAND_GOLD_RGB}, 0.55)`);
    gradient.addColorStop(1, `rgba(${BRAND_GOLD_RGB}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 6, 1);
  sprite.position.z = -1;
  return sprite;
}
