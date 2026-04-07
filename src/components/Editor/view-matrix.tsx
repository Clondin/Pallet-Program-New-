import { type TrayFace } from '../../types'

interface ViewMatrixProps {
  activeFace: TrayFace
  onFaceChange: (face: TrayFace) => void
}

export function ViewMatrix({ activeFace, onFaceChange }: ViewMatrixProps) {
  const isActive = (face: TrayFace) => activeFace === face
  const labelClass = (face: TrayFace) =>
    `text-[10px] font-medium ${isActive(face) ? 'text-[#0a72ef]' : 'text-[#bbb]'}`

  return (
    <div className="bg-white/60 backdrop-blur-sm shadow-card rounded-lg p-4">
      <div className="text-[9px] font-medium uppercase tracking-wider text-[#999] mb-3">
        View Matrix
      </div>
      <div className="relative w-20 h-20">
        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 ${labelClass('front')}`}>FRONT</span>
        <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${labelClass('back')}`}>BACK</span>
        <span className={`absolute top-1/2 -left-5 -translate-y-1/2 ${labelClass('left')}`}>LEFT</span>
        <span className={`absolute top-1/2 -right-6 -translate-y-1/2 ${labelClass('right')}`}>RIGHT</span>

        <div className="grid grid-cols-2 grid-rows-2 w-full h-full" style={{ boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.08)' }}>
          <button
            onClick={() => onFaceChange('front')}
            className={`w-full h-full transition-colors ${activeFace === 'front' ? 'bg-[#0a72ef]/10' : 'hover:bg-[#f5f5f5]'}`}
            style={activeFace === 'front' ? { boxShadow: 'inset 0 3px 0 0 #0a72ef' } : undefined}
          />
          <button
            onClick={() => onFaceChange('right')}
            className={`w-full h-full transition-colors ${activeFace === 'right' ? 'bg-[#0a72ef]/10' : 'hover:bg-[#f5f5f5]'}`}
            style={activeFace === 'right' ? { boxShadow: 'inset -3px 0 0 0 #0a72ef' } : undefined}
          />
          <button
            onClick={() => onFaceChange('left')}
            className={`w-full h-full transition-colors ${activeFace === 'left' ? 'bg-[#0a72ef]/10' : 'hover:bg-[#f5f5f5]'}`}
            style={activeFace === 'left' ? { boxShadow: 'inset 3px 0 0 0 #0a72ef' } : undefined}
          />
          <button
            onClick={() => onFaceChange('back')}
            className={`w-full h-full transition-colors ${activeFace === 'back' ? 'bg-[#0a72ef]/10' : 'hover:bg-[#f5f5f5]'}`}
            style={activeFace === 'back' ? { boxShadow: 'inset 0 -3px 0 0 #0a72ef' } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
