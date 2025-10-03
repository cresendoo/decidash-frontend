import {
  aptosWalletSignMessage,
  genEd25519AccountWithHex,
} from './utils'

/**
 * Deterministic 계정 생성 테스트
 *
 * 동일한 시드로부터 항상 동일한 계정이 생성되는지 검증합니다.
 */

export interface DeterministicTestResult {
  success: boolean
  iterations: number
  addresses: string[]
  allMatch: boolean
  message: string
}

/**
 * 시드의 deterministic 속성 테스트
 *
 * 동일한 시드로 여러 번 계정을 생성하여 항상 같은 주소가 나오는지 검증합니다.
 *
 * @param seed - 테스트할 시드값
 * @param iterations - 테스트 반복 횟수 (기본값: 10)
 * @returns 테스트 결과
 *
 * @example
 * ```ts
 * const seed = '0x1234...' as `0x${string}`
 * const result = await testDeterministicSeed(seed)
 *
 * console.log(result.success) // true
 * console.log(result.addresses) // ['0xabc...', '0xabc...', ...]
 * console.log(result.allMatch) // true
 * ```
 */
export async function testDeterministicSeed(
  seed: `0x${string}`,
  iterations = 10,
): Promise<DeterministicTestResult> {
  const addresses: string[] = []

  console.log(
    `[Deterministic Test] Testing seed with ${iterations} iterations...`,
  )
  console.log(
    `[Deterministic Test] Seed: ${seed.slice(0, 10)}...`,
  )

  try {
    // 여러 번 계정 생성
    for (let i = 0; i < iterations; i++) {
      const account = await genEd25519AccountWithHex(seed)
      const address = account.accountAddress.toString()
      addresses.push(address)

      if (i === 0) {
        console.log(
          `[Deterministic Test] First address: ${address}`,
        )
      }
    }

    // 모든 주소가 동일한지 확인
    const firstAddress = addresses[0]
    const allMatch = addresses.every(
      (addr) => addr === firstAddress,
    )

    const result: DeterministicTestResult = {
      success: allMatch,
      iterations,
      addresses,
      allMatch,
      message: allMatch
        ? `✅ Success! All ${iterations} iterations produced the same address: ${firstAddress}`
        : `❌ Failed! Addresses do not match. Found ${new Set(addresses).size} unique addresses.`,
    }

    console.log(`[Deterministic Test] ${result.message}`)

    return result
  } catch (error) {
    console.error('[Deterministic Test] Error:', error)
    return {
      success: false,
      iterations,
      addresses,
      allMatch: false,
      message: `❌ Error during test: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * 지갑 서명의 deterministic 속성 테스트
 *
 * 지갑으로 동일한 메시지를 여러 번 서명하여 항상 같은 서명값이 나오는지,
 * 그리고 그 서명값으로 생성한 계정이 항상 동일한지 검증합니다.
 *
 * @param getSignature - 지갑 서명 함수 (fullMessage를 받아 signature 반환)
 * @param iterations - 테스트 반복 횟수 (기본값: 5)
 * @returns 테스트 결과
 *
 * @example
 * ```tsx
 * const { signMessage } = useWallet()
 *
 * const result = await testDeterministicWalletSignature(
 *   async (fullMessage) => {
 *     const result = await signMessage({ message: fullMessage, nonce: 'test' })
 *     return result.signature as `0x${string}`
 *   },
 *   5
 * )
 * ```
 */
export async function testDeterministicWalletSignature(
  getSignature: (
    fullMessage: string,
  ) => Promise<`0x${string}`>,
  iterations = 5,
): Promise<
  DeterministicTestResult & { signatures: string[] }
> {
  const signatures: string[] = []
  const addresses: string[] = []

  console.log(
    `[Deterministic Test] Testing wallet signature with ${iterations} iterations...`,
  )

  try {
    const nonce = crypto.randomUUID()
    const message = 'DeciDash Deterministic Test'

    // 여러 번 서명 요청
    for (let i = 0; i < iterations; i++) {
      const fullMessage = aptosWalletSignMessage(
        message,
        nonce,
      )
      const signature = await getSignature(fullMessage)
      signatures.push(signature)

      // 서명으로 계정 생성
      const account =
        await genEd25519AccountWithHex(signature)
      const address = account.accountAddress.toString()
      addresses.push(address)

      if (i === 0) {
        console.log(
          `[Deterministic Test] First signature: ${signature.slice(0, 20)}...`,
        )
        console.log(
          `[Deterministic Test] First address: ${address}`,
        )
      }
    }

    // 모든 서명이 동일한지 확인
    const firstSignature = signatures[0]
    const signaturesMatch = signatures.every(
      (sig) => sig === firstSignature,
    )

    // 모든 주소가 동일한지 확인
    const firstAddress = addresses[0]
    const addressesMatch = addresses.every(
      (addr) => addr === firstAddress,
    )

    const allMatch = signaturesMatch && addressesMatch

    const result = {
      success: allMatch,
      iterations,
      signatures,
      addresses,
      allMatch,
      message: allMatch
        ? `✅ Success! All ${iterations} iterations produced the same signature and address.\n` +
          `Signature: ${firstSignature.slice(0, 20)}...\n` +
          `Address: ${firstAddress}`
        : `❌ Failed!\n` +
          `Signatures match: ${signaturesMatch} (${new Set(signatures).size} unique)\n` +
          `Addresses match: ${addressesMatch} (${new Set(addresses).size} unique)`,
    }

    console.log(`[Deterministic Test] ${result.message}`)

    return result
  } catch (error) {
    console.error('[Deterministic Test] Error:', error)
    return {
      success: false,
      iterations,
      signatures,
      addresses,
      allMatch: false,
      message: `❌ Error during test: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Main Account의 deterministic 속성 테스트
 *
 * Main Account가 항상 동일한 서명으로부터 동일한 계정을 생성하는지 검증합니다.
 *
 * @param getWalletSignature - 지갑 서명 함수
 * @param iterations - 테스트 반복 횟수 (기본값: 5)
 * @returns 테스트 결과
 *
 * @example
 * ```tsx
 * const { signMessage } = useWallet()
 *
 * const result = await testMainAccountDeterministic(
 *   async (fullMessage) => {
 *     const result = await signMessage({ message: fullMessage, nonce: 'test' })
 *     return result.signature as `0x${string}`
 *   }
 * )
 * ```
 */
export async function testMainAccountDeterministic(
  getWalletSignature: (
    fullMessage: string,
  ) => Promise<`0x${string}`>,
  iterations = 5,
): Promise<
  DeterministicTestResult & { mainAccounts: string[] }
> {
  const mainAccounts: string[] = []
  const addresses: string[] = []

  console.log(
    `[Deterministic Test] Testing Main Account with ${iterations} iterations...`,
  )

  try {
    // 동일한 nonce 사용 (deterministic 보장을 위해)
    const nonce = crypto.randomUUID()

    // 여러 번 Main Account 생성
    for (let i = 0; i < iterations; i++) {
      const mainMessage = aptosWalletSignMessage(
        'DeciDash Login',
        nonce,
      )
      const signature =
        await getWalletSignature(mainMessage)
      mainAccounts.push(signature)

      const account =
        await genEd25519AccountWithHex(signature)
      const address = account.accountAddress.toString()
      addresses.push(address)

      if (i === 0) {
        console.log(
          `[Deterministic Test] First Main Account: ${address}`,
        )
      }
    }

    // 모든 주소가 동일한지 확인
    const firstAddress = addresses[0]
    const allMatch = addresses.every(
      (addr) => addr === firstAddress,
    )

    const result = {
      success: allMatch,
      iterations,
      mainAccounts,
      addresses,
      allMatch,
      message: allMatch
        ? `✅ Success! All ${iterations} iterations produced the same Main Account: ${firstAddress}`
        : `❌ Failed! Main Accounts do not match. Found ${new Set(addresses).size} unique addresses.`,
    }

    console.log(`[Deterministic Test] ${result.message}`)

    return result
  } catch (error) {
    console.error('[Deterministic Test] Error:', error)
    return {
      success: false,
      iterations,
      mainAccounts,
      addresses,
      allMatch: false,
      message: `❌ Error during test: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
