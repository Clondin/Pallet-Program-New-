import { type TrayFace } from '../../types'

interface ViewMatrixProps {
  activeFace: TrayFace
  onFaceChange: (face: TrayFace) => void
}

export function ViewMatrix({ activeFace, onFaceChange }: ViewMatrixProps) {
  const isActive = (face: TrayFace) => activeFace === face
  const labelClass = (face: TrayFace) =>
    `text-[10px] font-bold ${isActive(face) ? 'text-[#2563eb]' : 'text-slate-400'}`

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-[#EDE5DA]/50 p-4">
      <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-3">
        View Matrix
      </div>
      <div className="relative w-20 h-20">
        {/* FRONT label - above */}
        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 ${labelClass('front')}`}>
          FRONT
        </span>
        {/* BACK label - below */}
        <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${labelClass('back')}`}>
          BACK
        </span>
        {/* LEFT label - left */}
        <span className={`absolute top-1/2 -left-5 -translate-y-1/2 ${labelClass('left')}`}>
          LEFT
        </span>
        {/* RIGHT label - right */}
        <span className={`absolute top-1/2 -right-6 -translate-y-1/2 ${labelClass('right')}`}>
          RIGHT
        </span>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full border-2 border-[#EDE5DA]">
          {/* Top-left: Front */}
          <button
            onClick={() => onFaceChange('front')}
            className={`w-full h-full ${
              activeFace === 'front'
                ? 'bg-primary/10 border-t-4 border-[#2563eb]'
                : ''
            }`}
          />
          {/* Top-right: Right */}
          <button
            onClick={() => onFaceChange('right')}
            className={`w-full h-full ${
              activeFace === 'right'
                ? 'bg-primary/10 border-r-4 border-[#2563eb]'
                : ''
            }`}
          />
          {/* Bottom-left: Left */}
          <button
            onClick={() => onFaceChange('left')}
            className={`w-full h-full ${
              activeFace === 'left'
                ? 'bg-primary/10 border-l-4 border-[#2563eb]'
                : ''
            }`}
          />
          {/* Bottom-right: Back */}
          <button
            onClick={() => onFaceChange('back')}
            className={`w-full h-full ${
              activeFace === 'back'
                ? 'bg-primary/10 border-b-4 border-[#2563eb]'
                : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}
