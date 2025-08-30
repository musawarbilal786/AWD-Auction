interface LogoProps {
  className?: string
  showTagline?: boolean
}

export function Logo({ className = "", showTagline = true }: LogoProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="inline-flex items-center justify-center mb-6">
        <div className="bg-sky-600 text-white px-3 py-1 rounded font-bold text-lg">AWD</div>
        <div className="ml-1 text-black font-bold text-lg">AUCTIONS</div>
      </div>
      {showTagline && (
        <div className="text-xs text-gray-500 uppercase tracking-wider">
          Auto Wholesale Digital Auctions
        </div>
      )}
    </div>
  )
} 