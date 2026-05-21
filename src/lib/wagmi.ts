"use client";

import { coinbaseWallet, injected } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { createClient } from "viem";
import { base } from "wagmi/chains";
import { DATA_SUFFIX } from "./contract";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
      unstable_shimAsyncInject: 1_000,
    }),
    coinbaseWallet({
      appName: "BaseFishing",
      appLogoUrl: "https://basefishing.vercel.app/favicon.ico",
    }),
  ],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
      dataSuffix: DATA_SUFFIX,
    });
  },
});
