import { AptosConfig, Network as AptosNetwork } from "@aptos-labs/ts-sdk";
import { DeciDashConfig } from "@coldbell/decidash-ts-sdk";

export type Network = {
    decidashConfig: DeciDashConfig;
    aptosConfig: AptosConfig;
}

export const Network = {
    DEVNET: {
        decidashConfig: DeciDashConfig.DEVNET,
        aptosConfig: new AptosConfig({
            network: AptosNetwork.DEVNET,
            fullnode: DeciDashConfig.DEVNET.node.HTTPURL,
        }),
    }
} as const;
