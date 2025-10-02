import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import type { ReactNode } from 'react'

/**
 * Aptos Connect 기반 지갑 프로바이더
 *
 * Aptos Connect는 Google 계정으로 간편하게 로그인할 수 있는
 * 키 없는(keyless) 지갑 솔루션입니다.
 *
 * 지원하는 연결 방법:
 * - Aptos Connect (Google 로그인)
 * - Petra Wallet (브라우저 확장 프로그램)
 * - 기타 Aptos 호환 지갑들
 *
 * @see https://docs.aptosconnect.app/docs/developers/quick-start/
 */

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({
  children,
}: WalletProviderProps) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false} // 보안을 위해 자동 연결 비활성화
      onError={(error) => {
        console.error('Wallet connection error:', error)
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
