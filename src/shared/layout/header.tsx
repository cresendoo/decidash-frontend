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
                  onClick={() => setShowWalletModal(false)}
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
                        No wallets detected. Please install
                        a wallet extension.
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
    </header>
  )
}
