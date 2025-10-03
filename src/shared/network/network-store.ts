import { create } from 'zustand'
import { Network } from './network'

// TODO: More network support
export const useNetwork = create<Network>(() =>
    getNetwork("DEVNET"), 
);

export const getNetwork = (network: keyof typeof Network) => {
    return Network[network];
}