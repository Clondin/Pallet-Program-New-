import type { RollupRow } from '../../lib/program-rollup'
import type { DisplayProject } from '../../types'

interface ProgramMatrixProps {
  pallets: DisplayProject[]
  rows: RollupRow[]
}

export function ProgramMatrix({ pallets, rows }: ProgramMatrixProps) {
  const palletTotals = pallets.map((pallet) => ({
    id: pallet.id,
    total: rows.reduce((sum, row) => sum + (row.palletCases.get(pallet.id) ?? 0), 0),
  }))

  return (
    <div className="bg-white shadow-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3 sticky left-0 bg-white z-10">
                Product
              </th>
              <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                SKU
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Pack
              </th>
              {pallets.map((pallet) => (
                <th
                  key={pallet.id}
                  className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3 min-w-[100px]"
                >
                  <div>{pallet.name}</div>
                  {pallet.shipByDate && (
                    <div className="text-[9px] text-[#ccc] font-normal normal-case mt-0.5">
                      Ship{' '}
                      {new Date(pallet.shipByDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </th>
              ))}
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Total Cases
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3">
                Total Units
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.productId}
                className="border-t border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
              >
                <td className="px-6 py-2.5 sticky left-0 bg-white z-10">
                  <p className="text-[13px] font-medium text-[#171717]">{row.productName}</p>
                  <p className="text-[11px] text-[#999]">{row.brand}</p>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-[#666] font-mono">{row.sku}</td>
                <td className="px-4 py-2.5 text-[12px] text-[#666] text-right tabular-nums">
                  {row.unitsPerCase ?? '—'}
                </td>
                {pallets.map((pallet) => {
                  const cases = row.palletCases.get(pallet.id) ?? 0

                  return (
                    <td
                      key={pallet.id}
                      className="px-4 py-2.5 text-[13px] text-right tabular-nums"
                      style={{ color: cases > 0 ? '#171717' : '#ddd' }}
                    >
                      {cases || '—'}
                    </td>
                  )
                })}
                <td className="px-4 py-2.5 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                  {row.totalCases}
                </td>
                <td className="px-6 py-2.5 text-[13px] font-medium text-[#171717] text-right tabular-nums">
                  {row.totalUnits ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#e5e5e5] bg-[#fafafa]">
              <td
                className="px-6 py-3 text-[12px] font-semibold text-[#171717] sticky left-0 bg-[#fafafa] z-10"
                colSpan={3}
              >
                Totals
              </td>
              {palletTotals.map((pallet) => (
                <td
                  key={pallet.id}
                  className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums"
                >
                  {pallet.total}
                </td>
              ))}
              <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                {rows.reduce((sum, row) => sum + row.totalCases, 0)}
              </td>
              <td className="px-6 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                {rows.reduce((sum, row) => sum + (row.totalUnits ?? 0), 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
