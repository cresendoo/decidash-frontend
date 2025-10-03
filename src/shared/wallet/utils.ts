export const genEd25519AccountWithHex = async (seed: `0x${string}`) => {
    const { Ed25519Account, Ed25519PrivateKey } = await import(
      "@aptos-labs/ts-sdk"
    );
    return new Ed25519Account({
      privateKey: new Ed25519PrivateKey(hexToBytes(seed).slice(0, 32)),
    });
};
  
export const hexToBytes = (hex: string) => {
    hex = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      const value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      if (isNaN(value)) throw new Error(`Invalid hex string: ${hex}`);
      bytes[i] = value;
    }
    return bytes;
};

export const aptosWalletSignMessage = (message: string, nonce: string) =>
  `APTOS\nmessage: ${message}\nnonce: ${nonce}`;