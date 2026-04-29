import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function BuyerHome() {
  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Buyer home
        </p>
        <h1 className="text-[32px] font-semibold tracking-display text-[#171717] mt-1">
          Demand & swings
        </h1>
        <p className="text-[13px] text-[#666] mt-2 max-w-2xl">
          Aggregate case demand across all pallets in a season, with year-over-year deltas so you
          can see what's swinging.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-12 text-center">
        <TrendingUp className="w-8 h-8 text-[#ccc] mx-auto mb-4" />
        <p className="text-[15px] font-semibold text-[#171717]">Demand view coming next</p>
        <p className="text-[13px] text-[#888] mt-2 max-w-md mx-auto">
          The buyer-focused aggregate table with case deltas and percent change is shipping in the
          next phase. For now, the existing Build Queue has similar data.
        </p>
        <Link
          to="/builders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors mt-5"
        >
          Open Build Queue
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
