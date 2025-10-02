import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'

/**
 * Aptos 지갑 연결을 위한 커스텀 훅
 *
 * @returns {Object} 지갑 상태 및 메서드
 * @property {string | null} account - 연결된 지갑 주소
 * @property {boolean} connected - 지갑 연결 상태
 * @property {boolean} connecting - 연결 중 상태
 * @property {Function} connect - 지갑 연결 함수
 * @property {Function} disconnect - 지갑 연결 해제 함수
 * @property {string | null} network - 현재 네트워크
 * @property {Array} wallets - 사용 가능한 지갑 목록
 *
 * @example
 * ```tsx
 * const { account, connected, connect, disconnect } = useWallet()
 *
 * if (!connected) {
 *   return <button onClick={connect}>Connect Wallet</button>
 * }
 *
 * return (
 *   <div>
 *     <p>Connected: {account}</p>
 *     <button onClick={disconnect}>Disconnect</button>
 *   </div>
 * )
 * ```
 */
export function useWallet() {
  const {
    account,
    connected,
    connect,
    disconnect,
    network,
    wallets,
    wallet,
  } = useAptosWallet()

  return {
    // 연결된 지갑 주소 (string | null)
    // AccountAddress를 string으로 변환
    account: account?.address?.toString() ?? null,

    // 지갑 연결 상태
    connected,

    // 지갑 연결 함수 (walletName을 인자로 받음)
    connect,

    // 지갑 연결 해제 함수
    disconnect,

    // 현재 네트워크 이름
    network: network?.name ?? null,

    // 사용 가능한 지갑 목록
    wallets,

    // 현재 연결된 지갑 정보
    wallet,

    // 전체 account 객체 (필요시 사용)
    accountInfo: account,
  }
}
