import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { useCallback } from 'react'

import { useWalletStore } from '@/shared/wallet/wallet-store'

/**
 * Aptos 지갑 연결 및 결정적 계정 관리를 위한 커스텀 훅
 *
 * ## 기능
 * 1. **지갑 연결**: Aptos Connect (Google 로그인) 또는 Petra Wallet 등을 통해 연결
 * 2. **결정적 계정 생성**: 지갑 서명으로부터 Main Account와 Delegate Account 생성
 * 3. **트랜잭션 서명**: 지갑을 통한 트랜잭션 서명
 *
 * @example
 * ```tsx
 * const {
 *   account,
 *   connected,
 *   connect,
 *   disconnect,
 *   wallets,
 *   mainAccount,
 *   delegateAccount,
 *   initAccounts,
 *   initializingAccounts
 * } = useWallet()
 *
 * // 1. 지갑 연결
 * if (!connected) {
 *   return (
 *     <button onClick={() => connect(wallets[0]?.name)}>
 *       Connect Wallet
 *     </button>
 *   )
 * }
 *
 * // 2. 결정적 계정 초기화
 * if (!delegateAccount) {
 *   return (
 *     <button onClick={initAccounts} disabled={initializingAccounts}>
 *       Initialize Trading Account
 *     </button>
 *   )
 * }
 *
 * // 3. 트레이딩 가능
 * return (
 *   <div>
 *     <p>Wallet: {account}</p>
 *     <p>Trading Account: {delegateAccount.accountAddress.toString()}</p>
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
    signMessage: aptosSignMessage,
  } = useAptosWallet()

  const {
    delegateAccountSeed,
    initializingAccounts,
    createDelegateAccount: createDelegateAccountStore,
    registerDelegation: registerDelegationStore,
    getDelegateAccount,
    hasDelegateAccount,
    reset: resetWalletStore,
  } = useWalletStore()

  /**
   * Main Account 생성
   *
   * 유저 지갑 서명을 통해 Main Account를 생성합니다.
   * Main Account는 저장되지 않으며, 필요할 때마다 재생성됩니다.
   * 항상 고정된 메시지로 서명하여 동일한 계정이 생성됩니다.
   */
  const createMainAccount = useCallback(async () => {
    console.log(
      '[useWallet] ========== CREATE MAIN ACCOUNT START ==========',
    )

    if (!aptosSignMessage) {
      console.error(
        '[useWallet] aptosSignMessage not available',
      )
      throw new Error(
        'Wallet does not support message signing',
      )
    }

    // 고정된 nonce와 메시지 (항상성 보장)
    const FIXED_NONCE = 'decidash-main-account-v1'
    const mainMessage = `Welcome to DeciDash!

By signing this message, you will:
• Create a deterministic trading account
• Enable secure fund management
• Authorize trading operations

This signature is used to generate your Main Account, which will manage your trading funds and delegate trading authority.

No fees or transactions will occur from this signature alone.`

    console.log(
      '[useWallet] Requesting signature from wallet...',
    )
    console.log('[useWallet] Message:', mainMessage)
    console.log('[useWallet] Nonce:', FIXED_NONCE)

    const result = await aptosSignMessage({
      message: mainMessage,
      nonce: FIXED_NONCE,
    })

    console.log('[useWallet] Signature received')
    console.log('[useWallet] Result:', result)

    // Aptos wallet adapter의 서명 결과를 hex string으로 변환
    const signatureStr = String(result.signature)
    console.log(
      '[useWallet] Signature string:',
      signatureStr.substring(0, 20) + '...',
    )

    // 0x 접두사가 없으면 추가
    const signature = signatureStr.startsWith('0x')
      ? signatureStr
      : `0x${signatureStr}`
    console.log(
      '[useWallet] Signature with 0x:',
      signature.substring(0, 20) + '...',
    )

    // Main Account 생성
    console.log('[useWallet] Generating Main Account...')
    const { genEd25519AccountWithHex } = await import(
      '@/shared/wallet/utils'
    )
    const mainAccount = await genEd25519AccountWithHex(
      signature as `0x${string}`,
    )

    console.log(
      '[useWallet] Main Account created:',
      mainAccount.accountAddress.toString(),
    )
    console.log(
      '[useWallet] ========== CREATE MAIN ACCOUNT SUCCESS ==========',
    )

    return mainAccount
  }, [aptosSignMessage])

  /**
   * 지갑 연결 해제 (계정 상태도 함께 초기화)
   */
  const disconnectWallet = useCallback(async () => {
    await disconnect()
    resetWalletStore()
  }, [disconnect, resetWalletStore])

  /**
   * 메시지 서명
   */
  const signMessage = useCallback(
    async (args: { message: string; nonce: string }) => {
      if (!aptosSignMessage) {
        throw new Error(
          'Wallet does not support message signing',
        )
      }
      return aptosSignMessage(args)
    },
    [aptosSignMessage],
  )

  return {
    // ============================================
    // 지갑 연결 상태
    // ============================================

    // 연결된 지갑 주소 (string | null)
    account: account?.address?.toString() ?? null,

    // 지갑 연결 상태
    connected,

    // 지갑 연결 함수 (walletName을 인자로 받음)
    connect,

    // 지갑 연결 해제 함수
    disconnect: disconnectWallet,

    // 현재 네트워크 이름
    network: network?.name ?? null,

    // 사용 가능한 지갑 목록
    wallets,

    // 현재 연결된 지갑 정보
    wallet,

    // 전체 account 객체 (필요시 사용)
    accountInfo: account,

    // ============================================
    // 결정적 계정 상태
    // ============================================

    // Delegate Account Seed (localStorage에 저장됨)
    delegateAccountSeed,

    // Delegate Account 존재 여부
    hasDelegateAccount: hasDelegateAccount(),

    // 계정 초기화 중 여부
    initializingAccounts,

    // ============================================
    // 액션
    // ============================================

    // Main Account 생성 (매번 서명 필요)
    createMainAccount,

    // Delegate Account 생성 (한 번만, localStorage에 저장)
    createDelegateAccount: async () => {
      const mainAccount = await createMainAccount()
      await createDelegateAccountStore(mainAccount)
    },

    // Delegation 등록 (Contract에 권한 위임)
    registerDelegation: async () => {
      const mainAccount = await createMainAccount()
      return registerDelegationStore(mainAccount)
    },

    // Delegate Account 가져오기 (localStorage에서 로드)
    getDelegateAccount,

    // 메시지 서명
    signMessage,
  }
}
