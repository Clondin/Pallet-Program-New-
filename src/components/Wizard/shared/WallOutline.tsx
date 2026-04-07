import React, { useCallback } from 'react'

type WallKey = 'front' | 'back' | 'left' | 'right'

interface WallOutlineProps {
  walls: Record<WallKey, { type: string }>
  activeWall?: string
  onWallClick?: (wall: WallKey) => void
}

const WALL_COLORS: Record<string, string> = {
  shelves: '#2563EB',
  'branded-panel': '#00A3C7',
  open: '#E2E8F0',
}

function getWallColor(type: string): string {
  return WALL_COLORS[type] ?? '#E2E8F0'
}

function isOpen(type: string): boolean {
  return type === 'open'
}

export function WallOutline({
  walls,
  activeWall,
  onWallClick,
}: WallOutlineProps) {
  const handleClick = useCallback(
    (wall: WallKey) => {
      onWallClick?.(wall)
    },
    [onWallClick]
  )

  const svgWidth = 200
  const svgHeight = 160
  const padding = 30
  const thickness = 6
  const rectX = padding
  const rectY = padding
  const rectW = svgWidth - padding * 2
  const rectH = svgHeight - padding * 2

  const wallDefs: Record<
    WallKey,
    { x1: number; y1: number; x2: number; y2: number; labelX: number; labelY: number }
  > = {
    front: {
      x1: rectX,
      y1: rectY + rectH,
      x2: rectX + rectW,
      y2: rectY + rectH,
      labelX: svgWidth / 2,
      labelY: rectY + rectH + 18,
    },
    back: {
      x1: rectX,
      y1: rectY,
      x2: rectX + rectW,
      y2: rectY,
      labelX: svgWidth / 2,
      labelY: rectY - 10,
    },
    left: {
      x1: rectX,
      y1: rectY,
      x2: rectX,
      y2: rectY + rectH,
      labelX: rectX - 8,
      labelY: svgHeight / 2,
    },
    right: {
      x1: rectX + rectW,
      y1: rectY,
      x2: rectX + rectW,
      y2: rectY + rectH,
      labelX: rectX + rectW + 8,
      labelY: svgHeight / 2,
    },
  }

  const wallKeys: WallKey[] = ['front', 'back', 'left', 'right']

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="select-none"
    >
      {/* Background fill */}
      <rect
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        fill="#FAFBFC"
        rx={4}
      />

      {wallKeys.map((key) => {
        const wall = walls[key]
        const def = wallDefs[key]
        const color = getWallColor(wall.type)
        const open = isOpen(wall.type)
        const active = activeWall === key
        const isVertical = key === 'left' || key === 'right'

        return (
          <g
            key={key}
            onClick={() => handleClick(key)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick(key)
              }
            }}
          >
            {/* Hover/click target (wider than visible line) */}
            <line
              x1={def.x1}
              y1={def.y1}
              x2={def.x2}
              y2={def.y2}
              stroke="transparent"
              strokeWidth={20}
            />

            {/* Active glow */}
            {active && (
              <line
                x1={def.x1}
                y1={def.y1}
                x2={def.x2}
                y2={def.y2}
                stroke={color}
                strokeWidth={thickness + 6}
                strokeOpacity={0.25}
                strokeLinecap="round"
              />
            )}

            {/* Wall line */}
            <line
              x1={def.x1}
              y1={def.y1}
              x2={def.x2}
              y2={def.y2}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={open ? '6 4' : 'none'}
              className="transition-all duration-150"
            >
              <title>{`${key}: ${wall.type}`}</title>
            </line>

            {/* Hover highlight */}
            <line
              x1={def.x1}
              y1={def.y1}
              x2={def.x2}
              y2={def.y2}
              stroke="white"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeOpacity={0}
              className="transition-opacity duration-150 hover:!stroke-opacity-20"
              style={{ pointerEvents: 'none' }}
            />

            {/* Label */}
            <text
              x={def.labelX}
              y={def.labelY}
              textAnchor={
                key === 'left' ? 'end' : key === 'right' ? 'start' : 'middle'
              }
              dominantBaseline={
                key === 'back' ? 'auto' : key === 'front' ? 'hanging' : 'middle'
              }
              fill="#94A3B8"
              fontSize={9}
              fontWeight={600}
              letterSpacing="0.05em"
              className="pointer-events-none uppercase"
              transform={
                isVertical
                  ? `rotate(${key === 'left' ? -90 : 90}, ${def.labelX}, ${def.labelY})`
                  : undefined
              }
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
