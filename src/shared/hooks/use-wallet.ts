import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'

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
    account: userWalletAccount,
    connected,
    connect,
    disconnect,
    network,
    wallets,
    wallet,
    signMessage: aptosSignMessage,
  } = useAptosWallet()

  const {
    mainAccountSeed,
    delegateAccountSeed,
    primarySubAccountAddress:
      storedPrimarySubAccountAddress,
    initializingAccounts,
    createMainAccount: createMainAccountStore,
    createDelegateAccount: createDelegateAccountStore,
    registerDelegation: registerDelegationStore,
    savePrimarySubAccountAddress:
      savePrimarySubAccountAddressStore,
    getDelegateAccount,
    hasDelegateAccount,
    reset: resetWalletStore,
  } = useWalletStore()

  /**
   * Primary Sub Account 주소 상태
   * localStorage에서 불러온 값을 사용, 없으면 조회
   */
  const [
    primarySubAccountAddress,
    setPrimarySubAccountAddress,
  ] = useState<string | null>(
    storedPrimarySubAccountAddress,
  )

  // localStorage 값이 변경되면 상태 업데이트
  useEffect(() => {
    setPrimarySubAccountAddress(
      storedPrimarySubAccountAddress,
    )
  }, [storedPrimarySubAccountAddress])

  // Primary Sub Account 주소가 없으면 조회 (한 번만)
  useEffect(() => {
    let mounted = true

    const fetchAndSavePrimarySubAccount = async () => {
      // 이미 저장된 값이 있으면 조회하지 않음
      if (
        storedPrimarySubAccountAddress ||
        !connected ||
        !hasDelegateAccount()
      ) {
        return
      }

      try {
        console.log(
          '[useWallet] Primary Sub Account not found, fetching...',
        )

        // Main Account 생성 (서명 한 번만 필요)
        const mainAccount = await createMainAccount()

        // Primary Sub Account 조회 및 저장
        await savePrimarySubAccountAddressStore(mainAccount)

        console.log('[useWallet] Primary Sub Account saved')
      } catch (error) {
        console.error(
          '[useWallet] Failed to fetch and save primary sub account:',
          error,
        )
      }
    }

    if (mounted) {
      fetchAndSavePrimarySubAccount()
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connected,
    mainAccountSeed,
    delegateAccountSeed,
    storedPrimarySubAccountAddress,
  ])

  /**
   * Main Account 생성 (Account 1)
   *
   * zustand 메모리에 저장된 seed가 있으면 재사용, 없으면 서명 요청
   * localStorage에는 저장하지 않음 (보안)
   */
  const createMainAccount = useCallback(async () => {
    try {
      // Aptos signMessage를 wallet-store가 기대하는 형식으로 변환
      const signMessageWrapper = aptosSignMessage
        ? async (args: {
            message: string
            nonce: string
          }) => {
            const result = await aptosSignMessage(args)
            // Signature 객체를 string으로 변환
            return {
              signature:
                typeof result.signature === 'string'
                  ? result.signature
                  : result.signature.toString(),
            }
          }
        : undefined

      // wallet-store의 createMainAccount 호출 (서명은 필요시에만)
      return await createMainAccountStore(
        signMessageWrapper,
      )
    } catch (error) {
      console.error(
        '[useWallet] Failed to create Main Account:',
        error,
      )
      throw error
    }
  }, [createMainAccountStore, aptosSignMessage])

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
      const result = await aptosSignMessage(args)
      // Signature 객체를 string으로 변환
      return {
        signature:
          typeof result.signature === 'string'
            ? result.signature
            : result.signature.toString(),
      }
    },
    [aptosSignMessage],
  )

  return {
    // ============================================
    // 지갑 연결 상태
    // ============================================

    // Primary Sub Account 주소 (헤더 등에서 표시용)
    account: primarySubAccountAddress,

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
    accountInfo: userWalletAccount,

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
