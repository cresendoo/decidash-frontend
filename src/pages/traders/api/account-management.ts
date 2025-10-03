import type {
  Account,
  InputEntryFunctionData,
} from '@aptos-labs/ts-sdk'
import { Aptos } from '@aptos-labs/ts-sdk'
import {
  configureUserSettingsForMarketPayload,
  createSubAccountPayload,
  delegateTradingToSubaccountPayload,
  depositToSubAccountAtPayload,
  depositToSubAccountPayload,
  getAccountPositions,
  mintUSDCPayload,
  postFeePayer,
  primarySubAccountPayload,
  withdrawFromSubAccountPayload,
} from '@coldbell/decidash-ts-sdk'
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { useNetwork } from '@/shared/network/network-store'
import { useWalletStore } from '@/shared/wallet/wallet-store'

import { CUSTOM_DEVNET_CONFIG } from './queries'

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

// ============================================
// 사용자 설정 (레버리지, 마진 모드)
// ============================================

export interface ConfigureUserSettingsArgs {
  marketAddress: string
  isCross: boolean
  userLeverage: number
}

export interface MarketUserSettings {
  userLeverage: number
  isIsolated: boolean
}

/**
 * 특정 마켓의 사용자 설정 조회
 *
 * includeDeleted: true로 설정하면 포지션이 없어도 설정값을 가져올 수 있습니다.
 *
 * @example
 * ```tsx
 * const { data: settings } = useMarketUserSettings(marketAddress)
 * ```
 */
export const useMarketUserSettings = (
  marketAddress?: string,
  options?: Omit<
    UseQueryOptions<MarketUserSettings | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getDelegateAccount, hasDelegateAccount } =
    useWalletStore()

  return useQuery({
    queryKey: ['marketUserSettings', marketAddress],
    queryFn: async () => {
      if (!marketAddress) return null

      const delegateAccount = await getDelegateAccount()
      if (!delegateAccount) return null

      const { primarySubAccountAddress } = await import(
        '@/shared/wallet/wallet-store'
      ).then((m) => m.useWalletStore.getState())
      if (!primarySubAccountAddress) return null

      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Account Management] Fetching market settings for:',
        address,
        marketAddress,
      )

      const positions = await getAccountPositions({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: primarySubAccountAddress,
        includeDeleted: true, // 포지션이 없어도 설정값 가져오기
        limit: 1,
        marketAddress,
      })

      console.log(
        '[Account Management] Market settings:',
        positions,
      )

      if (positions.length === 0) {
        // 설정이 없으면 기본값 반환
        return {
          userLeverage: 1,
          isIsolated: true,
        }
      }

      return {
        userLeverage: positions[0].user_leverage,
        isIsolated: positions[0].is_isolated,
      }
    },
    enabled: !!marketAddress && hasDelegateAccount(),
    staleTime: 10_000, // 10초
    ...options,
  })
}

/**
 * 마켓별 사용자 설정 변경
 *
 * Margin Mode (Cross/Isolated)와 Leverage를 설정합니다.
 * Main Account의 서명이 필요할 수 있으며, Delegate Account로 트랜잭션을 제출합니다.
 *
 * @example
 * ```tsx
 * const configureSettings = useConfigureUserSettings(createMainAccount)
 *
 * await configureSettings.mutateAsync({
 *   marketAddress: '0x...',
 *   isCross: false, // isolated
 *   userLeverage: 10,
 * })
 * ```
 */
export const useConfigureUserSettings = (
  createMainAccount:
    | (() => Promise<import('@aptos-labs/ts-sdk').Account>)
    | null,
  options?: Omit<
    UseMutationOptions<
      { txHash: string; marketAddress: string },
      Error,
      ConfigureUserSettingsArgs
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args) => {
      if (!createMainAccount) {
        throw new Error('Wallet not connected')
      }

      console.log(
        '[Account Management] Configuring user settings:',
        args,
      )

      // Delegate Account 로드
      const { getDelegateAccount, hasDelegateAccount } =
        useWalletStore.getState()

      if (!hasDelegateAccount()) {
        throw new Error(
          'Delegate account not found. Please initialize account first.',
        )
      }

      const delegateAccount = await getDelegateAccount()
      if (!delegateAccount) {
        throw new Error('Failed to load delegate account')
      }

      const { aptosConfig, decidashConfig } =
        useNetwork.getState()
      const aptos = new Aptos(aptosConfig)

      // localStorage에서 Primary Sub Account 주소 확인
      const {
        primarySubAccountAddress,
        savePrimarySubAccountAddress,
      } = await import('@/shared/wallet/wallet-store').then(
        (m) => m.useWalletStore.getState(),
      )

      let subAccountAddress = primarySubAccountAddress

      // 저장된 주소가 없으면 조회 및 저장 (서명 한 번만 필요)
      if (!subAccountAddress) {
        console.log(
          '[Account Management] Primary Sub Account not found, fetching with signature...',
        )

        // Main Account 생성 (서명 필요)
        const mainAccount = await createMainAccount()

        // Primary Sub Account 조회 및 저장
        await savePrimarySubAccountAddress(mainAccount)

        // 다시 가져오기
        const state = (
          await import('@/shared/wallet/wallet-store')
        ).useWalletStore.getState()
        subAccountAddress = state.primarySubAccountAddress

        if (!subAccountAddress) {
          throw new Error(
            'Failed to get Primary Sub Account address',
          )
        }

        console.log(
          '[Account Management] Primary Sub Account saved:',
          subAccountAddress,
        )
      } else {
        console.log(
          '[Account Management] Using cached Primary Sub Account:',
          subAccountAddress,
        )
      }

      // Payload 생성 (Sub Account 주소 사용)
      const payload = configureUserSettingsForMarketPayload(
        {
          subAccountAddress, // Sub Account (Contract의 user)
          marketAddress: args.marketAddress,
          isCross: args.isCross,
          userLeverage: args.userLeverage,
        },
      )

      // 트랜잭션 빌드
      const transaction =
        await aptos.transaction.build.simple({
          sender: delegateAccount.accountAddress,
          data: payload,
          withFeePayer: true,
          options: {
            expireTimestamp: Date.now() + 60_000,
          },
        })

      // Delegate Account로 서명
      const senderAuthenticator = aptos.transaction.sign({
        signer: delegateAccount,
        transaction,
      })

      // Fee-payer 트랜잭션 제출
      const tx = await postFeePayer({
        decidashConfig,
        aptos,
        signature: Array.from(
          senderAuthenticator.bcsToBytes(),
        ),
        transaction: Array.from(
          transaction.rawTransaction.bcsToBytes(),
        ),
      })

      console.log(
        '[Account Management] User settings configured:',
        tx.hash,
      )

      return {
        txHash: tx.hash,
        marketAddress: args.marketAddress,
      }
    },
    onSuccess: async (data) => {
      // 블록체인 트랜잭션 완료 대기 (2초)
      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      )

      // 설정 변경 후 해당 마켓의 설정값을 리페치
      await queryClient.invalidateQueries({
        queryKey: [
          'marketUserSettings',
          data.marketAddress,
        ],
        refetchType: 'active',
      })

      // 즉시 refetch
      await queryClient.refetchQueries({
        queryKey: [
          'marketUserSettings',
          data.marketAddress,
        ],
      })
    },
    ...options,
  })
}
