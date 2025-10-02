/**
 * Web3 스타일의 랜덤 픽셀 아바타 생성 유틸리티
 * Metamask에서 사용하는 jazzicon 스타일
 */

/**
 * 주소를 기반으로 아바타 SVG를 생성합니다
 * @param address - Wallet 주소
 * @param size - 아바타 크기 (기본값: 24)
 * @returns SVG 데이터 URL
 */
export function generateAvatar(
  address: string,
  size: number = 24,
): string {
  // 주소에서 색상 생성
  const colors = generateColors(address)

  // 8x8 그리드 생성
  const grid = generateGrid(address)

  // SVG 생성
  const cellSize = size / 8
  const cells = grid
    .map((row, y) =>
      row
        .map((value, x) => {
          if (value) {
            const color =
              colors[
                Math.abs(hashCode(address + x + y)) %
                  colors.length
              ]
            return `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`
          }
          return ''
        })
        .join(''),
    )
    .join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${colors[0]}" opacity="0.3"/>
      ${cells}
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 주소를 기반으로 색상 팔레트 생성
 */
function generateColors(address: string): string[] {
  const hash = hashCode(address)
  const hue = Math.abs(hash) % 360

  return [
    `hsl(${hue}, 70%, 50%)`,
    `hsl(${(hue + 60) % 360}, 70%, 60%)`,
    `hsl(${(hue + 120) % 360}, 70%, 55%)`,
    `hsl(${(hue + 180) % 360}, 70%, 50%)`,
  ]
}

/**
 * 주소를 기반으로 8x8 그리드 생성 (대칭)
 */
function generateGrid(address: string): boolean[][] {
  const grid: boolean[][] = []

  for (let y = 0; y < 8; y++) {
    const row: boolean[] = []
    for (let x = 0; x < 8; x++) {
      // 좌우 대칭을 위해 x < 4인 경우만 생성
      const actualX = x < 4 ? x : 7 - x
      const hash = hashCode(address + y + actualX)
      row.push(hash % 2 === 0)
    }
    grid.push(row)
  }

  return grid
}

/**
 * 문자열을 해시 코드로 변환
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
