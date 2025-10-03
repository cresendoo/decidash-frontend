import type {
  Account,
  InputEntryFunctionData,
} from '@aptos-labs/ts-sdk'
import { Aptos } from '@aptos-labs/ts-sdk'
import {
  createSubAccountPayload,
  delegateTradingToSubaccountPayload,
  depositToSubAccountAtPayload,
  depositToSubAccountPayload,
  mintUSDCPayload,
  postFeePayer,
  primarySubAccountPayload,
  withdrawFromSubAccountPayload,
} from '@coldbell/decidash-ts-sdk'
import {
  useMutation,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { useNetwork } from '@/shared/network/network-store'

/**
 * Account Management API
 *
 * Main Account (Account 1)이 필요한 관리 작업들
 *
 * ## 주요 기능
 * - 서브계정 생성
 * - 트레이딩 권한 위임
 * - 자금 입출금
 * - 테스트 자산 발급 (DEVNET)
 *
 * ## 사용 방법
 * 모든 mutation은 mainAccount를 인자로 받습니다.
 * mainAccount는 매번 사용자 서명으로 생성되어야 합니다.
 */

// ============================================
// Helper: 트랜잭션 제출
// ============================================

/**
 * Main Account로 트랜잭션 제출
 */
async function submitTxWithMainAccount(
  mainAccount: Account,
  payload: InputEntryFunctionData,
) {
  const { aptosConfig, decidashConfig } =
    useNetwork.getState()
  const aptos = new Aptos(aptosConfig)

  const transaction = await aptos.transaction.build.simple({
    sender: mainAccount.accountAddress,
    data: payload,
    withFeePayer: true,
    options: { expireTimestamp: Date.now() + 60_000 },
  })

  const senderAuthenticator = aptos.transaction.sign({
    signer: mainAccount,
    transaction,
  })

  const tx = await postFeePayer({
    decidashConfig,
    aptos,
    signature: Array.from(senderAuthenticator.bcsToBytes()),
    transaction: Array.from(
      transaction.rawTransaction.bcsToBytes(),
    ),
  })

  return { txHash: tx.hash, tx }
}

// ============================================
// 서브계정 생성
// ============================================

/**
 * 서브계정 생성
 *
 * @example
 * ```tsx
 * const createSubAccount = useCreateSubAccount()
 *
 * await createSubAccount.mutateAsync({ mainAccount })
 * ```
 */
export const useCreateSubAccount = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      { mainAccount: Account }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({ mainAccount }) => {
      console.log(
        '[Account Management] Creating sub account...',
      )

      const payload = createSubAccountPayload()
      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Sub account created:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

// ============================================
// 트레이딩 권한 위임
// ============================================

/**
 * Delegate Account에게 트레이딩 권한 위임
 *
 * Main Account가 Delegate Account에게 트레이딩 권한을 부여합니다.
 * 이 작업 후 Delegate Account로 주문을 제출할 수 있습니다.
 *
 * @example
 * ```tsx
 * const delegateTrading = useDelegateTrading()
 *
 * await delegateTrading.mutateAsync({
 *   mainAccount,
 *   delegateAccountAddress: '0x...',
 * })
 * ```
 */
export const useDelegateTrading = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        delegateAccountAddress: string
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({
      mainAccount,
      delegateAccountAddress,
    }) => {
      console.log(
        '[Account Management] Delegating trading to:',
        delegateAccountAddress,
      )

      const payload = delegateTradingToSubaccountPayload(
        delegateAccountAddress,
      )

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Trading delegated:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

// ============================================
// Primary 계정 설정
// ============================================

/**
 * Primary 서브계정 설정
 *
 * @example
 * ```tsx
 * const setPrimarySubAccount = useSetPrimarySubAccount()
 *
 * await setPrimarySubAccount.mutateAsync({
 *   mainAccount,
 *   primaryAddress: '0x...',
 * })
 * ```
 */
export const useSetPrimarySubAccount = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        primaryAddress: string
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({ mainAccount, primaryAddress }) => {
      console.log(
        '[Account Management] Setting primary sub account:',
        primaryAddress,
      )

      const payload =
        primarySubAccountPayload(primaryAddress)

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Primary sub account set:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

// ============================================
// 자금 입금
// ============================================

/**
 * 서브계정에 입금
 *
 * @example
 * ```tsx
 * const deposit = useDepositToSubAccount()
 *
 * await deposit.mutateAsync({
 *   mainAccount,
 *   amount: 1000,
 * })
 * ```
 */
export const useDepositToSubAccount = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        amount: number
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({ mainAccount, amount }) => {
      console.log(
        '[Account Management] Depositing to sub account:',
        amount,
      )

      const payload = depositToSubAccountPayload(amount)

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Deposited:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

/**
 * 특정 서브계정에 입금
 *
 * @example
 * ```tsx
 * const depositAt = useDepositToSubAccountAt()
 *
 * await depositAt.mutateAsync({
 *   mainAccount,
 *   subAccountAddress: '0x...',
 *   amount: 1000,
 * })
 * ```
 */
export const useDepositToSubAccountAt = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        subAccountAddress: string
        amount: number
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({
      mainAccount,
      subAccountAddress,
      amount,
    }) => {
      console.log(
        '[Account Management] Depositing to sub account at:',
        subAccountAddress,
        amount,
      )

      const payload = depositToSubAccountAtPayload(
        subAccountAddress,
        amount,
      )

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Deposited:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

// ============================================
// 자금 출금
// ============================================

/**
 * 서브계정에서 출금
 *
 * @example
 * ```tsx
 * const withdraw = useWithdrawFromSubAccount()
 *
 * await withdraw.mutateAsync({
 *   mainAccount,
 *   subAccountAddress: '0x...',
 *   amount: 1000,
 * })
 * ```
 */
export const useWithdrawFromSubAccount = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        subAccountAddress: string
        amount: number
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({
      mainAccount,
      subAccountAddress,
      amount,
    }) => {
      console.log(
        '[Account Management] Withdrawing from sub account:',
        subAccountAddress,
        amount,
      )

      const payload = withdrawFromSubAccountPayload(
        subAccountAddress,
        amount,
      )

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] Withdrawn:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}

// ============================================
// 테스트 자산 발급 (DEVNET)
// ============================================

/**
 * 테스트 USDC 발급 (DEVNET 전용)
 *
 * @example
 * ```tsx
 * const mintUSDC = useMintUSDC()
 *
 * await mintUSDC.mutateAsync({
 *   mainAccount,
 *   amount: 10000,
 * })
 * ```
 */
export const useMintUSDC = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      {
        mainAccount: Account
        amount: number
      }
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async ({ mainAccount, amount }) => {
      console.log(
        '[Account Management] Minting USDC:',
        amount,
      )

      const accountAddress =
        mainAccount.accountAddress.toString()
      const payload = mintUSDCPayload(
        accountAddress,
        amount,
      ) as InputEntryFunctionData

      const result = await submitTxWithMainAccount(
        mainAccount,
        payload,
      )

      console.log(
        '[Account Management] USDC minted:',
        result.txHash,
      )

      return { txHash: result.txHash }
    },
    ...options,
  })
}
