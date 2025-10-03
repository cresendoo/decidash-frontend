import {
  Account,
  Ed25519PrivateKey,
  Hex,
} from '@aptos-labs/ts-sdk'

/**
 * Aptos 지갑 표준 서명 메시지 포맷 생성
 *
 * @param message - 서명할 메시지 내용
 * @param nonce - 재사용 방지를 위한 고유 nonce
 * @returns 포맷팅된 전체 메시지
 *
 * @example
 * ```ts
 * const fullMessage = aptosWalletSignMessage('DeciDash Login', crypto.randomUUID())
 * // "APTOS\nmessage: DeciDash Login\nnonce: 123e4567-e89b-12d3-a456-426614174000"
 * ```
 */
export function aptosWalletSignMessage(
  message: string,
  nonce: string,
): string {
  return `APTOS\nmessage: ${message}\nnonce: ${nonce}`
}

/**
 * 16진수 시드로부터 결정적(deterministic) Ed25519 계정 생성
 *
 * 동일한 시드 입력에 대해 항상 동일한 계정을 생성합니다.
 * 이를 통해 지갑 서명으로부터 고정된 계정을 파생할 수 있습니다.
 *
 * @param seedHex - 0x 접두사를 포함한 16진수 시드 (임의 길이)
 * @returns Aptos Account 객체
 *
 * @example
 * ```ts
 * const signature = '0x1234...' // 지갑 서명값 (64바이트)
 * const account = await genEd25519AccountWithHex(signature)
 * console.log(account.accountAddress.toString()) // '0xabc...'
 * ```
 */
export async function genEd25519AccountWithHex(
  seedHex: `0x${string}`,
): Promise<Account> {
  // 서명값이 32바이트보다 크면 SHA-256 해시를 사용하여 32바이트로 축소
  let seed = seedHex

  // 0x 제외하고 길이 확인 (32바이트 = 64 hex chars)
  const hexLength = seedHex.length - 2

  if (hexLength > 64) {
    // 64자리(32바이트)보다 길면 SHA-256 해시 적용
    console.log(
      '[genEd25519AccountWithHex] Seed too long, hashing...',
      hexLength,
      'chars',
    )
    const encoder = new TextEncoder()
    const data = encoder.encode(seedHex)
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      data,
    )
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    seed =
      `0x${hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
    console.log(
      '[genEd25519AccountWithHex] Hashed seed (first 20 chars):',
      seed.substring(0, 20) + '...',
    )
  } else if (hexLength < 64) {
    // 64자리보다 짧으면 0으로 패딩
    console.log(
      '[genEd25519AccountWithHex] Seed too short, padding...',
      hexLength,
      'chars',
    )
    const padding = '0'.repeat(64 - hexLength)
    seed =
      `0x${seedHex.slice(2)}${padding}` as `0x${string}`
  }

  // 16진수 문자열을 Ed25519 개인키로 변환
  const privateKey = new Ed25519PrivateKey(
    Hex.fromHexString(seed).toUint8Array(),
  )

  // 개인키로부터 계정 생성
  return Account.fromPrivateKey({ privateKey })
}
