import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useWallet } from '@/shared/hooks'

import { Button } from './button'
import { Drawer } from './drawer'

export function MobileHeader() {
  const {
    account,
    connected,
    wallets,
    connect,
    disconnect,
  } = useWallet()
  const [showWalletModal, setShowWalletModal] =
    useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const nav = [
    { to: '/traders', label: 'Trade' },
    { to: '/top-traders', label: 'Top Traders' },
  ]

  // 주소를 짧게 표시
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnect = (walletName: string) => {
    connect(walletName)
    setShowWalletModal(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDrawerOpen(false)
  }

  return (
    <>
      <header
        className="sticky top-0 z-10 bg-stone-950"
        data-name="header"
        data-node-id="1642:1293"
      >
        <div className="flex h-14 items-center gap-4 px-2">
          {/* 햄버거 메뉴 */}
          <button
            aria-label="menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/5"
            onClick={() => setIsDrawerOpen(true)}
            data-node-id="1642:1295"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5"
            data-name="Logo"
            data-node-id="1642:1300"
          >
            <img
              src="/logo.svg"
              alt="DeciDash"
              className="h-[22px] w-[22px]"
              data-node-id="1642:1301"
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

          {/* Right side - icons + button */}
          <div
            className="flex flex-1 items-center justify-end gap-2"
            data-node-id="1642:1313"
          >
            <button
              aria-label="language"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
              data-node-id="1642:1314"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
              data-node-id="1642:1319"
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

            {/* Connect 버튼 */}
            {!connected ? (
              <div className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 rounded-lg px-4 text-xs font-medium"
                  onClick={() =>
                    setShowWalletModal(!showWalletModal)
                  }
                  data-node-id="1642:1414"
                >
                  Connect
                </Button>

                {/* 지갑 선택 모달 */}
                {showWalletModal && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() =>
                        setShowWalletModal(false)
                      }
                    />
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
            ) : null}
          </div>
        </div>
      </header>

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <img
              src="/logo.svg"
              alt="DeciDash"
              className="h-[22px] w-[22px]"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-4">
            {nav.map((item, i) => (
              <NavLink
                key={i}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#ede030]/10 text-[#ede030]'
                      : 'text-white hover:bg-white/5'
                  }`
                }
                onClick={() => setIsDrawerOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Wallet Section */}
          {connected && (
            <div className="mt-auto border-t border-stone-800 p-4">
              <div className="mb-3 rounded-lg border border-stone-800 bg-stone-900/50 px-4 py-3">
                <p className="mb-1 text-xs text-white/60">
                  Connected Wallet
                </p>
                <p className="text-sm font-medium text-white">
                  {account && formatAddress(account)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-lg"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}
