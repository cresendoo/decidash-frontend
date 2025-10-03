import { AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { DeciDashConfig } from '@coldbell/decidash-ts-sdk'
import { create } from 'zustand'

/**
 * 네트워크 설정 상태
 *
 * - decidashConfig: DeciDash API 설정 (DEVNET)
 * - aptosConfig: Aptos 노드 설정
 *
 * 개발 환경에서는 CORS 우회를 위해 Vite 프록시를 사용합니다.
 */

interface NetworkState {
  decidashConfig: typeof DeciDashConfig.DEVNET
  aptosConfig: AptosConfig
}

// 개발 환경에서 CORS 문제를 우회하기 위한 커스텀 설정
const isDevelopment = import.meta.env.DEV

const decidashConfig: typeof DeciDashConfig.DEVNET =
  isDevelopment
    ? {
        ...DeciDashConfig.DEVNET,
        tradingVM: {
          ...DeciDashConfig.DEVNET.tradingVM,
          APIURL: '', // 프록시 사용: /api 경로가 자동으로 백엔드로 프록시됨
        },
      }
    : DeciDashConfig.DEVNET

const aptosConfig = new AptosConfig({
  fullnode: DeciDashConfig.DEVNET.node.HTTPURL,
  network: Network.CUSTOM,
})

export const useNetwork = create<NetworkState>(() => ({
  decidashConfig,
  aptosConfig,
}))

