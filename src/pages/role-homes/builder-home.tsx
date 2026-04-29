import { Link } from 'react-router-dom'
import { ArrowRight, HardHat } from 'lucide-react'

export function BuilderHome() {
  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <HardHat className="w-3 h-3" />
          Builder home
        </p>
        <h1 className="text-[32px] font-semibold tracking-display text-[#171717] mt-1">
          Build queue
        </h1>
        <p className="text-[13px] text-[#666] mt-2 max-w-2xl">
          Pallets to assemble at Hook, Goshen, and 3rd party locations. Pull lists, daily build
          counts, and labor cost.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-12 text-center">
        <HardHat className="w-8 h-8 text-[#ccc] mx-auto mb-4" />
        <p className="text-[15px] font-semibold text-[#171717]">Builder board coming next</p>
        <p className="text-[13px] text-[#888] mt-2 max-w-md mx-auto">
          The location-grouped Kanban board with daily build logs is shipping in the next phase.
          The existing Build Queue page has the rollup view for now.
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
