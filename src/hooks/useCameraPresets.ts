import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraPreset } from '../types';

export function useCameraPresets(preset?: CameraPreset) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 24, 0)); // Default look at target
  const animatingRef = useRef(false);
  const startPosRef = useRef(new THREE.Vector3());
  const endPosRef = useRef(new THREE.Vector3());
  const progressRef = useRef(0);

  useEffect(() => {
    if (!preset) return;

    startPosRef.current.copy(camera.position);
    progressRef.current = 0;
    animatingRef.current = true;

    switch (preset) {
      case 'front':
        endPosRef.current.set(0, 30, 80);
        break;
      case 'side':
        endPosRef.current.set(80, 30, 0);
        break;
      case 'top':
        endPosRef.current.set(0, 90, 0.1);
        break;
      case 'isometric':
      default:
        endPosRef.current.set(72, 48, 72);
        break;
    }
  }, [preset, camera]);

  useFrame((state, delta) => {
    if (animatingRef.current) {
      // 600ms animation duration
      progressRef.current += delta / 0.6;
      
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        animatingRef.current = false;
      }

      // ease-out cubic
      const t = progressRef.current;
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startPosRef.current, endPosRef.current, ease);
      camera.lookAt(targetRef.current);
    }
  });

  return { isAnimating: animatingRef.current };
}
