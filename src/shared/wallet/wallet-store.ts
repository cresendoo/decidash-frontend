import type { Account } from '@aptos-labs/ts-sdk'
import { Aptos } from '@aptos-labs/ts-sdk'
import {
  delegateTradingToSubaccountPayload,
  postFeePayer,
} from '@coldbell/decidash-ts-sdk'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useNetwork } from '@/shared/network/network-store'

import { genEd25519AccountWithHex } from './utils'

/**
 * 지갑 및 결정적 계정 상태 관리
 *
 * ## 계정 생성 흐름
 *
 * 1. **유저 지갑 연결**: WalletConnect 등을 통해 유저 지갑 연결
 * 2. **메시지 서명 진행**: 지갑으로 메시지 서명 요청 → signature 획득
 * 3. **Account 1 생성 (Main Account)**:
 *    - `genEd25519AccountWithHex(signature)`를 통해 Decibel devnet에서 Account 1 생성
 *    - 지갑 주소와 1:1 매핑된 고정된 Account (서명 값으로부터 고정 생성됨)
 *    - 동일한 서명 사용 시 항상 동일한 Account 생성됨 (Deterministic)
 *    - **주의**: Main Account는 저장되지 않으며, 매번 서명을 통해 재생성됨
 * 4. **Delegate Account 생성 (Account 2)**:
 *    - Account 1으로 다시 서명 진행 → 이 서명값으로 다시 `genEd25519AccountWithHex()` 호출
 *    - Account 2 생성 (Delegate Account)
 *    - 이 계정이 추후 트레이딩 등 실제 활동을 수행할 실행 주체
 *    - **중요**: Delegate Account의 시드는 localStorage에 저장되어 재사용됨
 */

interface WalletState {
  // ============================================
  // 계정 상태
  // ============================================

  /**
   * Main Account Seed (Account 1)
   *
   * **메모리에만 저장** (localStorage X, 보안상 이유)
   * User Wallet 서명으로 생성된 Main Account의 seed
   * 이 시드로부터 Main Account를 언제든 재생성 가능
   * 페이지 새로고침 시 다시 서명 필요
   */
  mainAccountSeed: `0x${string}` | null

  /**
   * Delegate Account Seed (Account 2)
   *
   * localStorage에 persist되는 시드값
   * 이 시드로부터 Delegate Account를 언제든 재생성 가능
   */
  delegateAccountSeed: `0x${string}` | null

  /**
   * Primary Sub Account Address
   *
   * localStorage에 persist되는 주소값
   * Main Account (Account 1)로부터 조회한 Sub Account 주소
   */
  primarySubAccountAddress: string | null

  // ============================================
  // 로딩 및 에러 상태
  // ============================================

  /**
   * 계정 초기화 진행 중 여부
   */
  initializingAccounts: boolean

  /**
   * 에러 메시지
   */
  error: string | null

  // ============================================
  // 액션
  // ============================================

  /**
   * Main Account 생성 및 저장
   *
   * User Wallet 서명을 통해 Main Account를 생성하고 seed를 localStorage에 저장합니다.
   * 이미 생성된 경우 저장된 seed로 재생성합니다.
   *
   * @param signMessage - 지갑 서명 함수 (처음 생성 시에만 필요)
   *
   * @example
   * ```ts
   * const mainAccount = await createMainAccount(signMessage)
   * ```
   */
  createMainAccount: (
    signMessage?: (args: {
      message: string
      nonce: string
    }) => Promise<{ signature: string }>,
  ) => Promise<Account>

  /**
   * Delegate Account 생성 및 저장
   *
   * Main Account로부터 Delegate Account를 생성하고 시드를 localStorage에 저장합니다.
   *
   * @param mainAccount - Main Account (Account 1)
   *
   * @example
   * ```ts
   * const mainAccount = await genEd25519AccountWithHex(signature)
   * await createDelegateAccount(mainAccount)
   * ```
   */
  createDelegateAccount: (
    mainAccount: Account,
  ) => Promise<void>

  /**
   * Primary Sub Account 주소 저장
   *
   * Main Account로부터 조회한 Primary Sub Account 주소를 localStorage에 저장합니다.
   *
   * @param mainAccount - Main Account (Account 1)
   *
   * @example
   * ```ts
   * const mainAccount = await genEd25519AccountWithHex(signature)
   * await savePrimarySubAccountAddress(mainAccount)
   * ```
   */
  savePrimarySubAccountAddress: (
    mainAccount: Account,
  ) => Promise<void>

  /**
   * Delegate Account에게 트레이딩 권한 위임 (Contract 등록)
   *
   * Main Account가 Delegate Account에게 트레이딩 권한을 위임하는 트랜잭션을 제출합니다.
   * 이 작업 후 Delegate Account로 실제 트레이딩이 가능해집니다.
   *
   * @param mainAccount - Main Account (Account 1)
   *
   * @example
   * ```ts
   * const mainAccount = await genEd25519AccountWithHex(signature)
   * await registerDelegation(mainAccount)
   * ```
   */
  registerDelegation: (
    mainAccount: Account,
  ) => Promise<string>

  /**
   * localStorage에서 Delegate Account 로드
   *
   * @returns Delegate Account 또는 null
   */
  getDelegateAccount: () => Promise<Account | null>

  /**
   * Delegate Account 시드 확인
   *
   * @returns 시드 존재 여부
   */
  hasDelegateAccount: () => boolean

  /**
   * 상태 초기화
   *
   * Delegate Account 시드 및 에러 상태를 모두 초기화합니다.
   */
  reset: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // ============================================
      // 초기 상태
      // ============================================

      mainAccountSeed: null,
      delegateAccountSeed: null,
      primarySubAccountAddress: null,
      initializingAccounts: false,
      error: null,

      // ============================================
      // Main Account 생성 (Account 1)
      // ============================================

      async createMainAccount(signMessage) {
        try {
          const { mainAccountSeed } = get()

          // 이미 생성된 Main Account가 있으면 재사용
          if (mainAccountSeed) {
            console.log(
              '[WalletStore] Reusing existing Main Account seed',
            )
            const mainAccount =
              await genEd25519AccountWithHex(
                mainAccountSeed,
              )
            console.log(
              '[WalletStore] Main Account reloaded:',
              mainAccount.accountAddress.toString(),
            )
            return mainAccount
          }

          // 처음 생성 시 서명 필요
          if (!signMessage) {
            throw new Error(
              'signMessage is required for first-time Main Account creation',
            )
          }

          console.log(
            '[WalletStore] ========== CREATE MAIN ACCOUNT START ==========',
          )
          console.log(
            '[WalletStore] Creating Main Account with signature...',
          )

          set({
            initializingAccounts: true,
            error: null,
          })

          // 고정된 메시지로 서명 (deterministic)
          const message =
            'Sign to create your Decidash account'
          const nonce = 'decidash-main-account'

          const { signature } = await signMessage({
            message,
            nonce,
          })
          console.log(
            '[WalletStore] Signature obtained (first 20 chars):',
            signature.substring(0, 20) + '...',
          )

          // Main Account 생성
          const mainAccount =
            await genEd25519AccountWithHex(
              signature as `0x${string}`,
            )
          console.log(
            '[WalletStore] Main Account created:',
            mainAccount.accountAddress.toString(),
          )

          // Seed 저장
          set({
            mainAccountSeed: signature as `0x${string}`,
            initializingAccounts: false,
          })

          console.log(
            '[WalletStore] Main Account seed saved to localStorage',
          )
          console.log(
            '[WalletStore] ========== CREATE MAIN ACCOUNT SUCCESS ==========',
          )

          return mainAccount
        } catch (e: unknown) {
          console.error(
            '[WalletStore] ========== CREATE MAIN ACCOUNT ERROR ==========',
          )
          console.error('[WalletStore] Error:', e)
          const errorMessage =
            e instanceof Error ? e.message : String(e)
          set({
            error: errorMessage,
            initializingAccounts: false,
          })
          throw e
        }
      },

      // ============================================
      // Delegate Account 생성 (Account 2)
      // ============================================

      async createDelegateAccount() {
        try {
          console.log(
            '[WalletStore] ========== CREATE DELEGATE ACCOUNT START ==========',
          )

          set({
            initializingAccounts: true,
            error: null,
          })

          console.log(
            '[WalletStore] Creating Delegate Account...',
          )

          // Delegate Account 생성을 위한 랜덤 시드 생성 (항상성 없음)
          // crypto.getRandomValues를 사용하여 완전한 랜덤 32바이트 생성
          const randomBytes = new Uint8Array(32)
          crypto.getRandomValues(randomBytes)
          console.log(
            '[WalletStore] Random bytes generated:',
            randomBytes.length,
            'bytes',
          )

          const delegateSeed = `0x${Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')}` as `0x${string}`
          console.log(
            '[WalletStore] Delegate seed generated (first 20 chars):',
            delegateSeed.substring(0, 20) + '...',
          )

          // 시드 저장 (persist 미들웨어가 자동으로 localStorage에 저장)
          set({
            delegateAccountSeed: delegateSeed,
            initializingAccounts: false,
          })
          console.log(
            '[WalletStore] Seed saved to store state',
          )

          const delegateAccount =
            await genEd25519AccountWithHex(delegateSeed)

          console.log(
            '[WalletStore] Delegate Account created:',
            delegateAccount.accountAddress.toString(),
          )
          console.log(
            '[WalletStore] Seed saved to localStorage',
          )
          console.log(
            '[WalletStore] ========== CREATE DELEGATE ACCOUNT SUCCESS ==========',
          )
        } catch (e: unknown) {
          console.error(
            '[WalletStore] ========== CREATE DELEGATE ACCOUNT ERROR ==========',
          )
          console.error(
            '[WalletStore] Error type:',
            typeof e,
          )
          console.error('[WalletStore] Error object:', e)
          if (e instanceof Error) {
            console.error(
              '[WalletStore] Error message:',
              e.message,
            )
            console.error(
              '[WalletStore] Error stack:',
              e.stack,
            )
          }
          const errorMessage =
            e instanceof Error ? e.message : String(e)
          set({
            error: errorMessage,
            initializingAccounts: false,
          })
          throw e
        }
      },

      // ============================================
      // Primary Sub Account 저장
      // ============================================

      async savePrimarySubAccountAddress(mainAccount) {
        try {
          console.log(
            '[WalletStore] Saving Primary Sub Account address...',
          )

          const { aptosConfig } = useNetwork.getState()
          const aptos = new Aptos(aptosConfig)

          const { getPrimarySubAccount } = await import(
            '@coldbell/decidash-ts-sdk'
          )

          const subAccountAddress =
            await getPrimarySubAccount({
              aptos,
              primaryAddress:
                mainAccount.accountAddress.toString(),
            })

          console.log(
            '[WalletStore] Primary Sub Account:',
            subAccountAddress,
          )

          // localStorage에 저장
          set({
            primarySubAccountAddress: subAccountAddress,
          })

          console.log(
            '[WalletStore] Primary Sub Account saved to localStorage',
          )
        } catch (e: unknown) {
          console.error(
            '[WalletStore] Failed to save primary sub account:',
            e,
          )
          throw e
        }
      },

      // ============================================
      // Delegation 등록 (Contract에 권한 위임)
      // ============================================

      async registerDelegation(mainAccount) {
        try {
          console.log(
            '[WalletStore] ========== REGISTER DELEGATION START ==========',
          )
          console.log(
            '[WalletStore] Main Account received:',
            mainAccount?.accountAddress?.toString(),
          )

          set({
            initializingAccounts: true,
            error: null,
          })

          const { delegateAccountSeed } = get()
          console.log(
            '[WalletStore] Delegate seed exists:',
            !!delegateAccountSeed,
          )

          if (!delegateAccountSeed) {
            throw new Error(
              'Delegate account not found. Please create delegate account first.',
            )
          }

          // Delegate Account 로드
          console.log(
            '[WalletStore] Loading Delegate Account from seed...',
          )
          const delegateAccount =
            await genEd25519AccountWithHex(
              delegateAccountSeed,
            )
          console.log(
            '[WalletStore] Delegate Account loaded',
          )

          console.log(
            '[WalletStore] Registering delegation...',
          )
          console.log(
            '[WalletStore] Main Account:',
            mainAccount.accountAddress.toString(),
          )
          console.log(
            '[WalletStore] Delegate Account:',
            delegateAccount.accountAddress.toString(),
          )

          // Delegation payload 생성
          console.log(
            '[WalletStore] Creating delegation payload...',
          )
          const payload =
            delegateTradingToSubaccountPayload(
              delegateAccount.accountAddress.toString(),
            )
          console.log(
            '[WalletStore] Payload created:',
            payload.function,
          )

          // 트랜잭션 제출
          const { aptosConfig, decidashConfig } =
            useNetwork.getState()
          console.log(
            '[WalletStore] Network config:',
            aptosConfig.fullnode,
          )

          const aptos = new Aptos(aptosConfig)
          console.log('[WalletStore] Aptos client created')

          console.log(
            '[WalletStore] Building transaction...',
          )
          const transaction =
            await aptos.transaction.build.simple({
              sender: mainAccount.accountAddress,
              data: payload,
              withFeePayer: true,
              options: {
                expireTimestamp: Date.now() + 60_000,
              },
            })
          console.log(
            '[WalletStore] Transaction built successfully',
          )

          console.log(
            '[WalletStore] Signing transaction...',
          )
          const senderAuthenticator =
            aptos.transaction.sign({
              signer: mainAccount,
              transaction,
            })
          console.log(
            '[WalletStore] Transaction signed successfully',
          )

          console.log(
            '[WalletStore] Submitting to fee payer...',
          )
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
            '[WalletStore] Delegation registered. TxHash:',
            tx.hash,
          )
          console.log(
            '[WalletStore] ========== REGISTER DELEGATION SUCCESS ==========',
          )

          set({ initializingAccounts: false })

          return tx.hash
        } catch (e: unknown) {
          console.error(
            '[WalletStore] ========== REGISTER DELEGATION ERROR ==========',
          )
          console.error(
            '[WalletStore] Error type:',
            typeof e,
          )
          console.error('[WalletStore] Error object:', e)
          if (e instanceof Error) {
            console.error(
              '[WalletStore] Error message:',
              e.message,
            )
            console.error(
              '[WalletStore] Error stack:',
              e.stack,
            )
          }
          const errorMessage =
            e instanceof Error ? e.message : String(e)
          set({
            error: errorMessage,
            initializingAccounts: false,
          })
          throw e
        }
      },

      // ============================================
      // Delegate Account 로드
      // ============================================

      async getDelegateAccount() {
        const { delegateAccountSeed } = get()

        if (!delegateAccountSeed) {
          return null
        }

        try {
          return await genEd25519AccountWithHex(
            delegateAccountSeed,
          )
        } catch (e) {
          console.error(
            '[WalletStore] Failed to load delegate account:',
            e,
          )
          return null
        }
      },

      // ============================================
      // Delegate Account 확인
      // ============================================

      hasDelegateAccount() {
        return get().delegateAccountSeed !== null
      },

      // ============================================
      // 상태 초기화
      // ============================================

      reset() {
        set({
          mainAccountSeed: null,
          delegateAccountSeed: null,
          primarySubAccountAddress: null,
          initializingAccounts: false,
          error: null,
        })
      },
    }),
    {
      name: 'decidash-wallet-storage', // localStorage key
      partialize: (state) => ({
        // delegateAccountSeed, primarySubAccountAddress만 localStorage에 저장
        // mainAccountSeed는 메모리에만 (보안상 localStorage 저장 X)
        delegateAccountSeed: state.delegateAccountSeed,
        primarySubAccountAddress:
          state.primarySubAccountAddress,
      }),
    },
  ),
)
