import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { type ReactNode, useEffect, useState } from 'react'

/**
 * Aptos 지갑 프로바이더
 *
 * 지원하는 지갑:
 * - Petra Wallet (가장 인기 있는 Aptos 지갑)
 * - Martian Wallet
 * - Pontem Wallet
 * - Nightly Wallet
 * - Fewcha Wallet
 * - Rise Wallet
 *
 * @aptos-labs/wallet-adapter-react는 자동으로 브라우저에 설치된
 * Aptos 호환 지갑들을 감지하고 연결할 수 있게 해줍니다.
 */

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({
  children,
}: WalletProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      onError={(error) => {
        console.error('Wallet connection error:', error)
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
