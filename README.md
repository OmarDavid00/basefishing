# BaseFishing

BaseFishing is a Base Mini App for daily onchain fishing. Players connect a wallet, cast a daily or deep sea line, receive an instant onchain catch, and build a permanent fish encyclopedia.

## Stack

- Next.js App Router
- TypeScript
- Wagmi native config
- Viem
- Base mainnet

## Attribution

- Offchain attribution is hardcoded in `src/app/layout.tsx` with the `base:app_id` meta tag.
- Onchain attribution uses ERC-8021 calldata suffixing through `DATA_SUFFIX` in `src/lib/contract.ts`.
- Every contract write explicitly passes `dataSuffix`.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
