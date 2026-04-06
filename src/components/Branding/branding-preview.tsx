import { BRAND_COLORS } from '../../lib/mock-data'
import type { DisplayBranding, Brand } from '../../types'

interface BrandingPreviewProps {
  branding: DisplayBranding
  lipColor: string
}

const PREVIEW_BRANDS: { name: string; color: string }[] = [
  { name: 'Tuscanini', color: BRAND_COLORS.tuscanini },
  { name: 'Kedem', color: BRAND_COLORS.kedem },
  { name: 'Gefen', color: BRAND_COLORS.gefen },
  { name: 'Haddar', color: BRAND_COLORS.haddar },
  { name: 'Osem', color: BRAND_COLORS.osem },
]

export function BrandingPreview({ branding, lipColor }: BrandingPreviewProps) {
  const headerBg = branding.headerBackgroundColor || '#00A3C7'
  const headerText = branding.headerText || 'HEADER TEXT'
  const headerTextColor = branding.headerTextColor || '#FFFFFF'
  const lipText = branding.lipText || 'LIP TEXT'
  const lipTextColor = branding.lipTextColor || '#FFFFFF'

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="relative">
        <div className="aspect-[16/9] max-h-[420px] bg-[#f5f5f5] flex items-center justify-center p-8">
          <div className="w-full max-w-md flex flex-col items-center gap-0">
            {/* Header panel */}
            <div
              className="w-full rounded-t-lg px-6 py-8 flex items-center justify-center"
              style={{ backgroundColor: headerBg }}
            >
              <p
                className="text-2xl font-semibold text-center leading-tight whitespace-pre-line tracking-heading"
                style={{ color: headerTextColor }}
              >
                {headerText}
              </p>
            </div>

            {/* Tiers mockup */}
            <div className="w-full bg-amber-100/60" style={{ boxShadow: 'inset 1px 0 0 rgba(217,171,105,0.3), inset -1px 0 0 rgba(217,171,105,0.3)' }}>
              {[0, 1, 2].map((tier) => (
                <div
                  key={tier}
                  className="flex items-end justify-center gap-2 px-4 py-3"
                  style={{ boxShadow: '0 1px 0 0 rgba(217,171,105,0.2)' }}
                >
                  {PREVIEW_BRANDS.slice(tier, tier + 3).map((brand, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full shadow-ring"
                      style={{ backgroundColor: brand.color }}
                      title={brand.name}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Lip */}
            <div
              className="w-full rounded-b-lg px-4 py-2 flex items-center justify-center"
              style={{ backgroundColor: lipColor }}
            >
              <p
                className="text-[10px] font-medium tracking-wider uppercase text-center"
                style={{ color: lipTextColor }}
              >
                {lipText}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom metadata */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-4 py-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium rounded">
              Panel Preview
            </span>
            <span className="px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium rounded tabular-nums">
              48&quot; &times; 40&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
