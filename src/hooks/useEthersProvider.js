import { useMemo } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

/**
 * Hook to get ethers.js provider from Wagmi's public client
 * Based on official Wagmi + ethers.js integration docs
 */
export function useEthersProvider() {
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient) return null;
    
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };

    return new BrowserProvider(transport, network);
  }, [publicClient]);
}

/**
 * Hook to get ethers.js signer from Wagmi's wallet client
 * Based on official Wagmi + ethers.js integration docs
 */
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!walletClient || !publicClient) return null;
    
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };

    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
  }, [walletClient, publicClient]);
}
