import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const BRAND_GREEN_DARK = 0x102b23;
const BRAND_GOLD = 0xd8a94f;
const BRAND_GREEN_LIGHT = 0x7ba05d;

export function initHero3D(container: HTMLElement, getScrollProgress: () => number): void {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 6.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Placeholder product shape: rounded box standing in for the vending machine silhouette.
  const geometry = new RoundedBoxGeometry(2.2, 3.6, 1.3, 6, 0.22);
  const material = new THREE.MeshStandardMaterial({
    color: BRAND_GREEN_LIGHT,
    metalness: 0.35,
    roughness: 0.4,
  });
  const machine = new THREE.Mesh(geometry, material);
  scene.add(machine);

  // Thin gold trim near the base, echoing the brand's ribbon motif.
  const trimGeometry = new RoundedBoxGeometry(2.3, 0.12, 1.4, 4, 0.06);
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: BRAND_GOLD,
    metalness: 0.6,
    roughness: 0.3,
  });
  const trim = new THREE.Mesh(trimGeometry, trimMaterial);
  trim.position.y = -1.6;
  machine.add(trim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const goldRim = new THREE.DirectionalLight(BRAND_GOLD, 0.9);
  goldRim.position.set(-4, 1, -3);
  scene.add(goldRim);

  const fillLight = new THREE.DirectionalLight(BRAND_GREEN_DARK, 0.3);
  fillLight.position.set(0, -3, 2);
  scene.add(fillLight);

  function resize(): void {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  resize();
  window.addEventListener('resize', resize);

  function animate(): void {
    requestAnimationFrame(animate);
    const progress = getScrollProgress();
    machine.rotation.y = progress * Math.PI * 2;
    machine.rotation.x = Math.sin(progress * Math.PI) * 0.05;
    renderer.render(scene, camera);
  }
  animate();
}
