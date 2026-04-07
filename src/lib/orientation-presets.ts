export interface OrientationPreset {
  label: string
  rotation: [number, number, number]
}

export const ORIENTATION_PRESETS: OrientationPreset[] = [
  { label: 'Upright', rotation: [0, 0, 0] },
  { label: 'Rotated 90°', rotation: [0, Math.PI / 2, 0] },
  { label: 'Rotated 180°', rotation: [0, Math.PI, 0] },
  { label: 'Rotated 270°', rotation: [0, -Math.PI / 2, 0] },
  { label: 'Lying Back', rotation: [-Math.PI / 2, 0, 0] },
  { label: 'Lying Side', rotation: [0, 0, Math.PI / 2] },
]

export function getOrientationRotation(index: number = 0): [number, number, number] {
  return ORIENTATION_PRESETS[index % ORIENTATION_PRESETS.length].rotation
}

export function nextOrientation(current: number = 0): number {
  return (current + 1) % ORIENTATION_PRESETS.length
}
