import { useNetwork } from "@/shared/network/network-store";
import type { Wallet } from "@/shared/wallet/wallet-store"
import { aptosWalletSignMessage, genEd25519AccountWithHex } from "@/shared/wallet/utils";
import type { WalletAdapter } from "@/shared/wallet/wallet-adapter";
import { Aptos, type UserTransactionResponse } from "@aptos-labs/ts-sdk";
import { postFeePayer } from "@coldbell/decidash-ts-sdk"

export interface MockWallet extends Wallet {
  type: 'mock'
  address: `0x${string}`;
  seed: `0x${string}`;
}

export const mockWalletAdapter: WalletAdapter<MockWallet> = {
    type: "mock",
  
    async signMsg(wallet, { message, nonce }) {
      const signer = await genEd25519AccountWithHex(wallet.seed);
      const fullMessage = aptosWalletSignMessage(message, nonce);
      const publicKey = signer.publicKey.toString();
      const signature = signer.sign(fullMessage).toString();
      return { fullMessage, publicKey, signature };
    },
  
  async submitTx(wallet, payload) {
      const { aptosConfig, decidashConfig } = useNetwork();
      const aptos = new Aptos(aptosConfig);
      const signer = await genEd25519AccountWithHex(wallet.seed);
        
      const transaction = await aptos.transaction.build.simple({
        sender: signer.accountAddress,
        data: payload,
        withFeePayer: true,
        options: { expireTimestamp: Date.now() + 60_000 },
      });
      const senderAuthenticator = aptos.transaction.sign({
        signer,
        transaction,
      });
      const tx = await postFeePayer({
        decidashConfig,
        aptos,
        signature: Array.from(senderAuthenticator.bcsToBytes()),
        transaction: Array.from(transaction.rawTransaction.bcsToBytes()),
      });
      const userTx = tx as UserTransactionResponse;
      return { txHash: tx.hash, tx: userTx };
    },
};