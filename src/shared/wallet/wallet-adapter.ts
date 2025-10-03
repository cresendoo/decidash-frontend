import type {
    InputEntryFunctionData,
    UserTransactionResponse,
  } from "@aptos-labs/ts-sdk";

  import type { Wallet } from "@/shared/wallet/wallet-store";
  
  export interface WalletAdapter<T extends Wallet> {
    type: T["type"];
  
    signMsg?: (
      wallet: T,
      payload: { message: string; nonce: string },
    ) => Promise<{ fullMessage: string; publicKey: string; signature: string }>;
  
    submitTx: (
      wallet: T,
      payload: InputEntryFunctionData,
      options?: { maxGasAmount?: string },
    ) => Promise<{ txHash: string; tx?: UserTransactionResponse } | "skip">;
  }
  
  const walletAdapters: {
    [walletType: string]: WalletAdapter<Wallet>;
  } = {};
  
  export const registerWalletAdapter = async (
    ...adapters: WalletAdapter<Wallet>[]
  ) => {
    for (const adapter of adapters) {
      walletAdapters[adapter.type] = adapter;
    }
  };
  
  export const loadWalletAdapter = async (
    walletType: string,
  ): Promise<WalletAdapter<Wallet>> => {
    const adapter = walletAdapters[walletType];
    if (!adapter) throw new Error(`no ${walletType} adapter`);
    return adapter;
  };
  