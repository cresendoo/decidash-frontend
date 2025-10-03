export type Wallet = { type: string };


export const useWallet = create<Wallet>((set) => ({
    type: 'mock',
    address: '0x0',
    seed: '0x0',
}));