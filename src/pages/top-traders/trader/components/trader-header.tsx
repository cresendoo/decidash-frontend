import { Link } from 'react-router-dom'

interface TraderHeaderProps {
  address?: string
}

export default function TraderHeader({
  address,
}: TraderHeaderProps) {
  // Mock address for testing
  const mockAddress =
    '0x955b081079c839f2d765105e226efe6f2db3c35c6355a619c946c9ad1c1a003d'
  const userAddress = address ?? mockAddress

  // Address 축약 (0x15b3...3a42 형식)
  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex h-9 w-full items-center justify-between">
      {/* Left: Back button + Address box */}
      <div className="flex items-center gap-3">
        <Link
          to="/top-traders"
          className="flex h-9 items-center justify-center gap-2 rounded-lg bg-stone-900 px-2 pr-3"
        >
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M10 12L6 8l4-4"
            />
          </svg>
          <p className="text-xs font-medium leading-4 text-white">
            Back
          </p>
        </Link>

        <div className="flex h-9 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 pr-2">
          <p className="text-xs font-medium leading-4 text-white">
            {shortenAddress(userAddress)}
          </p>
          <button className="flex h-4 w-4 items-center justify-center">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 16 16"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="1.5"
                rx="1"
              />
              <path
                d="M6 3V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button className="flex h-4 w-4 items-center justify-center">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Hidden on mobile, shows support link on desktop */}
      <div className="hidden items-center md:flex">
        <button
          className="text-xs leading-5 text-yellow-300 hover:underline"
          onClick={() => {
            // Support us 클릭 핸들러
          }}
        >
          Support us
        </button>
      </div>
    </div>
  )
}
