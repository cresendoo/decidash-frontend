import { create } from 'zustand';

export type Wallet = { type: string };

// TODO: 여기 어케하지
export const useWallet = create<Wallet>(() => ({
    type: 'mock',
    address: '0x0',
    seed: '0x0',
}));