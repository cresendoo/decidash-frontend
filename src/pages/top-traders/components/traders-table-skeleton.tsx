export default function TradersTableSkeleton() {
  return (
    <section className="rounded-lg border border-gray-800 bg-[#0f1115] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-300">
          Traders
        </div>
        <div className="flex items-center gap-2">
          <input
            className="rounded bg-gray-900 px-3 py-1 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none"
            placeholder="Search by address..."
          />
          <button className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800">
            Filters
          </button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900/60">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-2">Trader</th>
              <th className="px-4 py-2">Perp Equity</th>
              <th className="px-4 py-2">Main Position</th>
              <th className="px-4 py-2">Direction Bias</th>
              <th className="px-4 py-2">Daily PnL</th>
              <th className="px-4 py-2">Weekly PnL</th>
              <th className="px-4 py-2">30D PnL</th>
              <th className="px-4 py-2">All Time PnL</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr
                key={i}
                className="border-t border-gray-800"
              >
                <td className="px-4 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
