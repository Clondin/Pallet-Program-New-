import * as THREE from 'three';

let slotMaterialGhost: THREE.LineDashedMaterial | null = null;
let slotMaterialHover: THREE.MeshBasicMaterial | null = null;
let slotMaterialSelected: THREE.MeshBasicMaterial | null = null;

export function getSlotMaterialGhost() {
  if (slotMaterialGhost) return slotMaterialGhost;
  slotMaterialGhost = new THREE.LineDashedMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    dashSize: 0.5,
    gapSize: 0.5,
  });
  return slotMaterialGhost;
}

export function getSlotMaterialHover() {
  if (slotMaterialHover) return slotMaterialHover;
  slotMaterialHover = new THREE.MeshBasicMaterial({
    color: '#4F8CFF',
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  return slotMaterialHover;
}

export function getSlotMaterialSelected() {
  if (slotMaterialSelected) return slotMaterialSelected;
  slotMaterialSelected = new THREE.MeshBasicMaterial({
    color: '#4F8CFF',
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  return slotMaterialSelected;
}
