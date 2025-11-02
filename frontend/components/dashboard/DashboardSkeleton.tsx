'use client'

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-white border-b border-gray-200">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div className="p-2 bg-gray-300 rounded-lg w-9 h-9"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded w-12 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white shadow-sm border-t border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-5 bg-gray-300 rounded w-24"></div>
              <div className="h-6 bg-gray-300 rounded w-8"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 bg-gray-300 rounded-xl w-44"></div>
              <div className="h-9 bg-gray-300 rounded-xl w-32"></div>
              <div className="h-9 bg-gray-300 rounded-xl w-32"></div>
              <div className="h-9 bg-gray-300 rounded-xl w-32"></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="px-6 py-3 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-center" style={{ width: '3%' }}>
                    <div className="h-3 bg-gray-300 rounded w-4 mx-auto"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '25%' }}>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '14%' }}>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '12%' }}>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '13%' }}>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '9%' }}>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '7%' }}>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </th>
                  <th className="px-3 py-2 text-left" style={{ width: '5%' }}>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </th>
                  <th className="px-3 py-2 text-right" style={{ width: '7%' }}>
                    <div className="h-3 bg-gray-300 rounded w-16 ml-auto"></div>
                  </th>
                  <th className="px-3 py-2 text-center" style={{ width: '4%' }}>
                    <div className="h-3 bg-gray-300 rounded w-12 mx-auto"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-center">
                      <div className="h-4 bg-gray-300 rounded w-4 mx-auto"></div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded flex-1"></div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-6 bg-gray-300 rounded w-24"></div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-6 bg-gray-300 rounded w-28"></div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                        <div className="h-6 bg-gray-300 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-12"></div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-6 bg-gray-300 rounded w-12"></div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="h-4 bg-gray-300 rounded w-16 ml-auto"></div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

