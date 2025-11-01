export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm">
        {/* Pulsing gradient bar - No spinner */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}

