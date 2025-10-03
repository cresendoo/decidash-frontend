import { Aptos } from '@aptos-labs/ts-sdk'
import {
  type AccountOverviews,
  type FundingRateHistoryEntry,
  getAccountOverviews,
  getAccountPositions,
  getPortfolioChart,
  getUserFundingRateHistory,
  getUserOpenOrders,
  getUserTradeHistory,
  type MarketTradeHistory,
  type OpenOrder,
  placeOrderToSubaccountPayload,
  type PortfolioChartDataType,
  type PortfolioChartPoint,
  type PortfolioChartRange,
  postFeePayer,
  type TimeInForce,
  type UserPosition,
} from '@coldbell/decidash-ts-sdk'
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { useNetwork } from '@/shared/network/network-store'
import { useWalletStore } from '@/shared/wallet/wallet-store'

import { CUSTOM_DEVNET_CONFIG } from './queries'

/**
 * Trading API
 *
 * Delegate Account (Account 2)를 사용하는 트레이딩 작업들
 *
 * ## 주요 기능
 * - 주문 제출
 * - 포지션 조회
 * - 주문 조회
 * - 거래 내역 조회
 * - 계정 상태 조회
 *
 * ## 사용 방법
 * Delegate Account는 localStorage에서 자동으로 로드됩니다.
 * 사용자 서명은 필요하지 않습니다.
 */

// ============================================
// Helper: Delegate Account 가져오기
// ============================================

/**
 * localStorage에서 Delegate Account 로드
 *
 * @throws Error - Delegate Account가 없는 경우
 */
async function getDelegateAccount() {
  const { getDelegateAccount, hasDelegateAccount } =
    useWalletStore.getState()

  if (!hasDelegateAccount()) {
    throw new Error(
      'Delegate account not found. Please initialize account first.',
    )
  }

  const account = await getDelegateAccount()
  if (!account) {
    throw new Error('Failed to load delegate account')
  }

  return account
}

// ============================================
// 주문 제출
// ============================================

export interface PlaceOrderArgs {
  marketAddress: string
  price: number
  size: number
  isLong: boolean
  timeInForce: TimeInForce
  isReduceOnly: boolean
  clientOrderId?: number
  stopPrice?: number
  tpTriggerPrice?: number
  tpLimitPrice?: number
  slTriggerPrice?: number
  slLimitPrice?: number
  builderAddress?: string
  builderFee?: number
}

/**
 * 주문 제출
 *
 * Delegate Account를 사용하여 주문을 제출합니다.
 *
 * @example
 * ```tsx
 * const placeOrder = usePlaceOrder()
 *
 * await placeOrder.mutateAsync({
 *   marketAddress: '0x...',
 *   price: 50000,
 *   size: 0.1,
 *   isLong: true,
 *   timeInForce: 'GTC',
 *   isReduceOnly: false,
 * })
 * ```
 */
export const usePlaceOrder = (
  options?: Omit<
    UseMutationOptions<
      { txHash: string },
      Error,
      PlaceOrderArgs
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: async (args) => {
      console.log('[Trading] Placing order:', args)

      const delegateAccount = await getDelegateAccount()
      const { aptosConfig, decidashConfig } =
        useNetwork.getState()
      const aptos = new Aptos(aptosConfig)

      // Payload 생성
      const payload = placeOrderToSubaccountPayload({
        accountAddress:
          delegateAccount.accountAddress.toString(),
        marketAddress: args.marketAddress,
        price: args.price,
        size: args.size,
        isLong: args.isLong,
        timeInForce: args.timeInForce,
        isReduceOnly: args.isReduceOnly,
        clientOrderId: args.clientOrderId,
        stopPrice: args.stopPrice,
        tpTriggerPrice: args.tpTriggerPrice,
        tpLimitPrice: args.tpLimitPrice,
        slTriggerPrice: args.slTriggerPrice,
        slLimitPrice: args.slLimitPrice,
        builderAddress: args.builderAddress,
        builderFee: args.builderFee,
      })

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

      console.log('[Trading] Order placed:', tx.hash)

      return { txHash: tx.hash }
    },
    ...options,
  })
}

// ============================================
// 포지션 조회
// ============================================

/**
 * Delegate Account의 포지션 조회
 *
 * @example
 * ```tsx
 * const { data: positions, isLoading } = useAccountPositions()
 * ```
 */
export const useDelegateAccountPositions = (
  options?: Omit<
    UseQueryOptions<UserPosition[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegateAccountPositions'],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching positions for:',
        address,
      )

      const positions = await getAccountPositions({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
        includeDeleted: false,
        limit: 100,
      })

      console.log('[Trading] Positions:', positions)

      return positions
    },
    staleTime: 30_000, // 30초
    refetchInterval: 30_000,
    ...options,
  })
}

// ============================================
// 주문 조회
// ============================================

/**
 * Delegate Account의 미체결 주문 조회
 *
 * @example
 * ```tsx
 * const { data: openOrders, isLoading } = useOpenOrders()
 * ```
 */
export const useDelegateOpenOrders = (
  options?: Omit<
    UseQueryOptions<OpenOrder[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegateOpenOrders'],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching open orders for:',
        address,
      )

      const orders = await getUserOpenOrders({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
      })

      console.log('[Trading] Open orders:', orders)

      return orders
    },
    staleTime: 10_000, // 10초
    refetchInterval: 10_000,
    ...options,
  })
}

// ============================================
// 거래 내역 조회
// ============================================

/**
 * Delegate Account의 거래 내역 조회
 *
 * @example
 * ```tsx
 * const { data: tradeHistory, isLoading } = useTradeHistory()
 * ```
 */
export const useDelegateTradeHistory = (
  options?: Omit<
    UseQueryOptions<MarketTradeHistory[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegateTradeHistory'],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching trade history for:',
        address,
      )

      const history = await getUserTradeHistory({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
      })

      console.log('[Trading] Trade history:', history)

      return history
    },
    staleTime: 60_000, // 1분
    refetchInterval: 60_000,
    ...options,
  })
}

// ============================================
// 계정 상태 조회
// ============================================

/**
 * Delegate Account의 계정 상태 조회
 *
 * @example
 * ```tsx
 * const { data: overview, isLoading } = useDelegateAccountOverview()
 * ```
 */
export const useDelegateAccountOverview = (
  options?: Omit<
    UseQueryOptions<AccountOverviews | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegateAccountOverview'],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching account overview for:',
        address,
      )

      const overview = await getAccountOverviews({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
      })

      console.log('[Trading] Account overview:', overview)

      return overview
    },
    staleTime: 30_000, // 30초
    refetchInterval: 30_000,
    ...options,
  })
}

// ============================================
// 포트폴리오 차트
// ============================================

/**
 * Delegate Account의 포트폴리오 차트 조회
 *
 * @example
 * ```tsx
 * const { data: chart, isLoading } = useDelegatePortfolioChart('1d', 'pnl')
 * ```
 */
export const useDelegatePortfolioChart = (
  range: PortfolioChartRange = '1d',
  dataType: PortfolioChartDataType = 'pnl',
  options?: Omit<
    UseQueryOptions<PortfolioChartPoint[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegatePortfolioChart', range, dataType],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching portfolio chart for:',
        address,
        range,
        dataType,
      )

      const chart = await getPortfolioChart({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
        range,
        dataType,
      })

      console.log('[Trading] Portfolio chart:', chart)

      return chart
    },
    staleTime: 60_000, // 1분
    refetchInterval: 60_000,
    ...options,
  })
}

// ============================================
// 펀딩 비용 내역
// ============================================

/**
 * Delegate Account의 펀딩 비용 내역 조회
 *
 * @example
 * ```tsx
 * const { data: fundingHistory, isLoading } = useDelegateFundingHistory()
 * ```
 */
export const useDelegateFundingHistory = (
  options?: Omit<
    UseQueryOptions<FundingRateHistoryEntry[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['delegateFundingHistory'],
    queryFn: async () => {
      const delegateAccount = await getDelegateAccount()
      const address =
        delegateAccount.accountAddress.toString()

      console.log(
        '[Trading] Fetching funding history for:',
        address,
      )

      const history = await getUserFundingRateHistory({
        decidashConfig: CUSTOM_DEVNET_CONFIG,
        user: address,
      })

      console.log('[Trading] Funding history:', history)

      return history
    },
    staleTime: 60_000, // 1분
    refetchInterval: 60_000,
    ...options,
  })
}
