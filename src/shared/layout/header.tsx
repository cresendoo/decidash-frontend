import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useWallet } from '@/shared/hooks'

import { Button } from '../components/button'
import { MobileHeader } from '../components/mobile-header'

export default function Header() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () =>
      window.removeEventListener('resize', checkMobile)
  }, [])
  const {
    account,
    connected,
    wallets,
    connect,
    disconnect,
  } = useWallet()
  const [showWalletModal, setShowWalletModal] =
    useState(false)

  const nav = [
    { to: '/traders', label: 'Trade' },
    { to: '/top-traders', label: 'Top Traders' },
  ]

  // 주소를 짧게 표시 (예: 0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnect = (walletName: string) => {
    connect(walletName)
    setShowWalletModal(false)
  }

  const handleDisconnect = () => {
    disconnect()
  }

  // 모바일일 경우 MobileHeader 렌더링
  if (isMobile) {
    return <MobileHeader />
  }

  return (
    <header
      className="sticky top-0 z-10 bg-stone-950"
      data-name="header"
      data-node-id="1641:228"
    >
      <div className="mx-auto flex h-14 items-center gap-4 px-2">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5"
          data-name="Logo"
          data-node-id="1641:229"
        >
          <img
            src="/logo.svg"
            alt="DeciDash"
            className="h-[22px] w-[22px]"
          />
          <p className="whitespace-nowrap text-white">
            <span className="text-[15px] font-normal">
              Deci
            </span>
            <span className="font-serif text-[15.5px] italic tracking-[0.2325px]">
              dash
            </span>
          </p>
        </Link>

        {/* Navigation - flex-grow */}
        <nav
          className="flex min-w-0 flex-1 items-center gap-1"
          data-node-id="1641:235"
        >
          {nav.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                `flex h-9 items-center justify-center rounded-lg px-4 text-xs font-medium leading-4 ${
                  isActive ? 'text-[#ede030]' : 'text-white'
                } whitespace-nowrap hover:text-[#ede030]`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side - icons + button */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="language"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            data-node-id="1641:242"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </button>
          <button
            aria-label="settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            data-node-id="1641:247"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          {/* 지갑 연결 버튼 */}
          {!connected ? (
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                className="h-9 rounded-lg px-4"
                onClick={() =>
                  setShowWalletModal(!showWalletModal)
                }
                data-node-id="1641:251"
              >
                Connect Wallet
              </Button>

              {/* 지갑 선택 모달 */}
              {showWalletModal && (
                <>
                  {/* 배경 오버레이 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() =>
                      setShowWalletModal(false)
                    }
                  />
                  {/* 모달 */}
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-stone-800 bg-stone-950 p-4 shadow-xl">
                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Connect a Wallet
                    </h3>
                    <div className="flex flex-col gap-2">
                      {wallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          onClick={() =>
                            handleConnect(wallet.name)
                          }
                          className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900/50 px-4 py-3 text-left transition-colors hover:bg-stone-800"
                        >
                          {wallet.icon && (
                            <img
                              src={wallet.icon}
                              alt={wallet.name}
                              className="h-6 w-6 rounded"
                            />
                          )}
                          <span className="text-sm text-white">
                            {wallet.name}
                          </span>
                        </button>
                      ))}
                      {wallets.length === 0 && (
                        <p className="text-xs text-white/60">
                          No wallets detected. Please
                          install a wallet extension.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">
                {account && formatAddress(account)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg px-4"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
