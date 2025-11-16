import { useState, useEffect } from 'react';

/**
 * Hook to load deployed contract addresses
 * @returns {Object} Contract addresses and loading state
 */
export const useContracts = () => {
  const [contracts, setContracts] = useState({
    fractionalization: null,
    marketplace: null,
    mockNFT: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const response = await fetch('/src/contracts/deployments.json');
        if (response.ok) {
          const deployments = await response.json();
          setContracts({
            fractionalization: deployments.fractionalization,
            marketplace: deployments.marketplace,
            mockNFT: deployments.mockNFT
          });
        }
      } catch {
        console.log('Deployments not found, contracts need to be deployed');
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();
  }, []);

  return { contracts, isLoading };
};

