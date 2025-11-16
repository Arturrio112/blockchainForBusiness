import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost, mainnet, sepolia } from 'wagmi/chains';

// Define localhost chain properly
const hardhatLocal = {
  id: 31337, // Hardhat default
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'FractionX - NFT Fractionalization',
  projectId: 'YOUR_PROJECT_ID', // TODO SETUP FROM https://cloud.walletconnect.com
  chains: [
    hardhatLocal,
    localhost, // Also support standard localhost (chain ID 1337)
    mainnet,
    sepolia,
  ],
  ssr: false,
});

