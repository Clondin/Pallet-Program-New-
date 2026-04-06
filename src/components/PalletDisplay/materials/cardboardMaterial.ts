import * as THREE from 'three';

let cardboardMaterial: THREE.MeshStandardMaterial | null = null;
const lipMaterials = new Map<string, THREE.MeshStandardMaterial>();
let headerMaterial: THREE.MeshStandardMaterial | null = null;

function createCorrugationNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  
  if (context) {
    // Base normal (flat)
    context.fillStyle = 'rgb(128, 128, 255)';
    context.fillRect(0, 0, 256, 256);
    
    // Draw vertical lines for corrugation
    // 8-10 ridges per inch. Let's say texture covers 10 inches -> 80 ridges.
    const ridges = 80;
    for (let i = 0; i < 256; i++) {
      const value = Math.sin((i / 256) * Math.PI * 2 * ridges);
      // Map to normal space (R channel varies, G=128, B=255)
      const r = Math.floor(128 + value * 127);
      const g = 128;
      const b = 255;
      context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      context.fillRect(i, 0, 1, 256);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function getCardboardMaterial() {
  if (cardboardMaterial) return cardboardMaterial;

  const normalMap = createCorrugationNormalMap();

  cardboardMaterial = new THREE.MeshStandardMaterial({
    color: '#C4956A',
    roughness: 0.9,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
  });

  return cardboardMaterial;
}

export function getHeaderMaterial() {
  if (headerMaterial) return headerMaterial;

  const normalMap = createCorrugationNormalMap();

  headerMaterial = new THREE.MeshStandardMaterial({
    color: '#D4A574',
    roughness: 0.9,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
  });

  return headerMaterial;
}

export function getLipMaterial(color: string = '#3B7DD8') {
  if (lipMaterials.has(color)) {
    return lipMaterials.get(color)!;
  }

  const normalMap = createCorrugationNormalMap();

  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
  });

  lipMaterials.set(color, mat);
  return mat;
}
