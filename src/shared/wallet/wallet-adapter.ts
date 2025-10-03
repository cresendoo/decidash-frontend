import {
  Aptos,
  type InputEntryFunctionData,
  type UserTransactionResponse,
} from '@aptos-labs/ts-sdk'
import { postFeePayer } from '@coldbell/decidash-ts-sdk'

import { useNetwork } from '@/shared/network/network-store'

import {
  aptosWalletSignMessage,
  genEd25519AccountWithHex,
} from './utils'

// ============================================
// Wallet Types
// ============================================

/**
 * 기본 지갑 인터페이스
 */
export interface Wallet {
  type: string
  address: `0x${string}`
}

/**
 * Mock 지갑 (개발/테스트용)
 *
 * 시드로부터 직접 계정을 생성하여 서명합니다.
 */
export interface MockWallet extends Wallet {
  type: 'mock'
  seed: `0x${string}`
}

/**
 * Aptos 지갑 (Petra, Aptos Connect 등)
 *
 * 브라우저 확장 프로그램이나 키리스 솔루션을 통해 서명합니다.
 */
export interface AptosWallet extends Wallet {
  type: 'aptos'
  signMessage: (args: {
    message: string
    nonce: string
  }) => Promise<{
    signature: string
    fullMessage: string
  }>
}

// ============================================
// Wallet Adapter Interface
// ============================================

/**
 * 서명 요청 파라미터
 */
export interface SignMessageArgs {
  message: string
  nonce: string
}

/**
 * 서명 결과
 */
export interface SignMessageResult {
  fullMessage: string
  publicKey: string
  signature: string
}

/**
 * 트랜잭션 제출 결과
 */
export interface SubmitTxResult {
  txHash: string
  tx: UserTransactionResponse
}

/**
 * 지갑 어댑터 인터페이스
 *
 * 각 지갑 타입에 대해 통일된 방식으로 서명 및 트랜잭션을 처리합니다.
 */
export interface WalletAdapter<TWallet extends Wallet> {
  type: TWallet['type']

  /**
   * 메시지 서명
   */
  signMsg: (
    wallet: TWallet,
    args: SignMessageArgs,
  ) => Promise<SignMessageResult>

  /**
   * Fee-payer 트랜잭션 제출
   */
  submitTx: (
    wallet: TWallet,
    payload: InputEntryFunctionData,
  ) => Promise<SubmitTxResult>
}

// ============================================
// Mock Wallet Adapter
// ============================================

/**
 * Mock 지갑 어댑터 (개발/테스트용)
 *
 * 시드로부터 직접 계정을 생성하여 서명하고 트랜잭션을 제출합니다.
 */
export const mockWalletAdapter: WalletAdapter<MockWallet> =
  {
    type: 'mock',

    async signMsg(wallet, { message, nonce }) {
      const signer = await genEd25519AccountWithHex(
        wallet.seed,
      )
      const fullMessage = aptosWalletSignMessage(
        message,
        nonce,
      )
      const publicKey = signer.publicKey.toString()
      const signature = signer.sign(fullMessage).toString()
      return { fullMessage, publicKey, signature }
    },

    async submitTx(wallet, payload) {
      const { aptosConfig, decidashConfig } =
        useNetwork.getState()
      const aptos = new Aptos(aptosConfig)
      const signer = await genEd25519AccountWithHex(
        wallet.seed,
      )

      const transaction =
        await aptos.transaction.build.simple({
          sender: signer.accountAddress,
          data: payload,
          withFeePayer: true,
          options: { expireTimestamp: Date.now() + 60_000 },
        })

      const senderAuthenticator = aptos.transaction.sign({
        signer,
        transaction,
      })

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

      const userTx = tx as UserTransactionResponse
      return { txHash: tx.hash, tx: userTx }
    },
  }

// ============================================
// Aptos Wallet Adapter
// ============================================

/**
 * Aptos 지갑 어댑터 (Petra, Aptos Connect 등)
 *
 * 브라우저 확장 프로그램이나 키리스 솔루션을 통해 서명하고,
 * DeciDash의 fee-payer를 사용하여 트랜잭션을 제출합니다.
 */
export const aptosWalletAdapter: WalletAdapter<AptosWallet> =
  {
    type: 'aptos',

    async signMsg(wallet, { message, nonce }) {
      // Aptos 지갑의 signMessage 호출
      const result = await wallet.signMessage({
        message,
        nonce,
      })
      return {
        fullMessage: result.fullMessage,
        publicKey: '', // Aptos wallet adapter에서는 publicKey를 직접 제공하지 않을 수 있음
        signature: result.signature,
      }
    },

    async submitTx(_wallet, _payload) {
      // TODO: Aptos wallet adapter의 signTransaction API 통합 필요
      throw new Error(
        'Aptos wallet transaction signing not yet implemented',
      )
    },
  }
