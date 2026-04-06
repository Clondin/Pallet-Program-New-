import { useCallback, useState } from 'react'
import { useDisplayStore } from '../../stores/display-store'
import { TrayFace, CameraPreset } from '../../types'

const CAMERA_FOR_FACE: Record<TrayFace, CameraPreset> = {
  front: 'front',
  back: 'side',
  left: 'side',
  right: 'front',
}

// Each face has a Y rotation that brings it to the front of the cube
const ROTATION_FOR_FACE: Record<TrayFace, number> = {
  front: -35,
  right: -125,
  back: -215,
  left: -305,
}

const FACES: TrayFace[] = ['front', 'right', 'back', 'left']

interface PalletNavigatorProps {
  className?: string
}

export function PalletNavigator({ className }: PalletNavigatorProps) {
  const activeFace = useDisplayStore(s => s.activeFace)
  const setActiveFace = useDisplayStore(s => s.setActiveFace)
  const viewMode = useDisplayStore(s => s.viewMode)
  const setCameraPreset = useDisplayStore(s => s.setCameraPreset)

  // Cube rotation tracks which face is "forward"
  const [rotY, setRotY] = useState(ROTATION_FOR_FACE[activeFace])

  const handleFaceClick = useCallback(
    (face: TrayFace) => {
      setActiveFace(face)
      setRotY(ROTATION_FOR_FACE[face])
      if (viewMode === '3d') {
        setCameraPreset(CAMERA_FOR_FACE[face])
      }
    },
    [viewMode, setActiveFace, setCameraPreset]
  )

  const cubeSize = 52
  const half = cubeSize / 2

  const faceStyle = (face: TrayFace, transform: string): React.CSSProperties => {
    const isActive = activeFace === face
    return {
      width: cubeSize,
      height: cubeSize,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '2px',
      transition: 'background 0.3s, border 0.3s',
      cursor: 'pointer',
      transform,
      background: isActive
        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        : 'linear-gradient(135deg, #e8e4de 0%, #d4cfc8 100%)',
      border: isActive ? '2px solid #1d4ed8' : '1px solid #c4bfb8',
    }
  }

  const labelClass = (face: TrayFace) =>
    `text-[11px] font-bold ${activeFace === face ? 'text-white' : 'text-slate-500'}`

  return (
    <div className={`flex flex-col items-center ${className ?? ''}`}>
      <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200/50 shadow-sm p-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2 text-center">
          Navigator
        </div>

        {/* Isometric cube that rotates to show the active face */}
        <div
          className="relative mx-auto"
          style={{
            width: cubeSize * 1.8,
            height: cubeSize * 1.6,
            perspective: '400px',
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(-25deg) rotateY(${rotY}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Front */}
            <button
              onClick={() => handleFaceClick('front')}
              style={faceStyle('front', `translateZ(${half}px)`)}
            >
              <span className={labelClass('front')}>Front</span>
            </button>

            {/* Back */}
            <button
              onClick={() => handleFaceClick('back')}
              style={faceStyle('back', `translateZ(-${half}px) rotateY(180deg)`)}
            >
              <span className={labelClass('back')}>Back</span>
            </button>

            {/* Right */}
            <button
              onClick={() => handleFaceClick('right')}
              style={faceStyle('right', `rotateY(90deg) translateZ(${half}px)`)}
            >
              <span className={labelClass('right')}>Right</span>
            </button>

            {/* Left */}
            <button
              onClick={() => handleFaceClick('left')}
              style={faceStyle('left', `rotateY(-90deg) translateZ(${half}px)`)}
            >
              <span className={labelClass('left')}>Left</span>
            </button>

            {/* Top (non-interactive) */}
            <div
              className="absolute"
              style={{
                width: cubeSize,
                height: cubeSize,
                transform: `rotateX(90deg) translateZ(${half}px)`,
                background: 'linear-gradient(135deg, #ebe7e1 0%, #ddd9d3 100%)',
                border: '1px solid #c4bfb8',
                borderRadius: '2px',
              }}
            />

            {/* Bottom (non-interactive) */}
            <div
              className="absolute"
              style={{
                width: cubeSize,
                height: cubeSize,
                transform: `rotateX(-90deg) translateZ(${half}px)`,
                background: '#c4a882',
                border: '1px solid #b09672',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        {/* Face buttons — always accessible fallback */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {FACES.map(face => (
            <button
              key={face}
              onClick={() => handleFaceClick(face)}
              className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide transition-all ${
                activeFace === face
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {face[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
