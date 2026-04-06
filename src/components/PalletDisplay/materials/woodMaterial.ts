import * as THREE from 'three';

export function createWoodMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Random base color between #A07520 and #C89830
  let rBase = 160 + Math.random() * 40; // 160 to 200
  let gBase = 117 + Math.random() * 35; // 117 to 152
  let bBase = 32 + Math.random() * 16;  // 32 to 48
  
  // 20% chance of weathering (gray tint)
  if (Math.random() < 0.2) {
    // Mix 30% gray (#808080)
    rBase = rBase * 0.7 + 128 * 0.3;
    gBase = gBase * 0.7 + 128 * 0.3;
    bBase = bBase * 0.7 + 128 * 0.3;
  }
  
  if (context) {
    context.fillStyle = `rgb(${rBase}, ${gBase}, ${bBase})`;
    context.fillRect(0, 0, 512, 512);
    
    // Add noise for grain
    for (let i = 0; i < 3000; i++) {
      context.fillStyle = `rgba(90, 40, 10, ${Math.random() * 0.25})`;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 150 + 50; // longer
      const h = Math.random() * 6 + 2;    // wider
      context.fillRect(x, y, w, h);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(`rgb(${Math.floor(rBase)}, ${Math.floor(gBase)}, ${Math.floor(bBase)})`),
    roughness: 0.85,
    map: texture,
  });
}
