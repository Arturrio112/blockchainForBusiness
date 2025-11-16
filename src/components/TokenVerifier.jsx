import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getMockNFTContract, getFractionalTokenContract } from '../utils/contractHelpers';

const TokenVerifier = ({ fractionalTokenAddress, nftAddress, tokenId }) => {
  const { provider, account, contracts } = useWeb3();
  const [verification, setVerification] = useState({
    nftOwner: null,
    userBalance: null,
    tokenTotalSupply: null,
    tokenSymbol: null,
    tokenName: null,
    isLoading: true
  });

  useEffect(() => {
    if (provider && fractionalTokenAddress) {
      verifyTokens();
    }
  }, [provider, fractionalTokenAddress, account]);

  const verifyTokens = async () => {
    try {
      setVerification(prev => ({ ...prev, isLoading: true }));

      // Check NFT ownership
      const nftContract = getMockNFTContract(nftAddress, provider);
      const nftOwner = await nftContract.ownerOf(tokenId);

      // Check fractional token balance
      const tokenContract = getFractionalTokenContract(fractionalTokenAddress, provider);
      const userBalance = await tokenContract.balanceOf(account);
      const totalSupply = await tokenContract.totalSupply();
      const tokenSymbol = await tokenContract.symbol();
      const tokenName = await tokenContract.name();

      setVerification({
        nftOwner,
        userBalance: userBalance.toString(),
        tokenTotalSupply: totalSupply.toString(),
        tokenSymbol,
        tokenName,
        isLoading: false
      });
    } catch (error) {
      console.error('Verification error:', error);
      setVerification(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (verification.isLoading) {
    return (
      <div className="mt-4 p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg animate-pulse">
        <p className="text-purple-300">Verifying tokens...</p>
      </div>
    );
  }

  const isNFTLocked = verification.nftOwner?.toLowerCase() === contracts.fractionalization?.toLowerCase();

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-lg">
      <h3 className="text-lg font-black text-green-400 mb-4">VERIFICATION RESULTS</h3>
      
      <div className="space-y-3">
        {/* NFT Lock Status */}
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <p className="text-sm text-gray-400">NFT Lock Status:</p>
            <p className={`font-bold ${isNFTLocked ? 'text-green-400' : 'text-yellow-400'}`}>
              {isNFTLocked 
                ? 'NFT is locked in fractionalization contract' 
                : 'NFT is not in contract (unexpected)'}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-mono break-all">
              Owner: {verification.nftOwner}
            </p>
          </div>
        </div>

        {/* Token Balance */}
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <p className="text-sm text-gray-400">Your Fractional Tokens:</p>
            <p className="font-bold text-green-400">
              {Number(verification.userBalance).toLocaleString()} tokens
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total Supply: {Number(verification.tokenTotalSupply).toLocaleString()}
            </p>
            <p className="text-xs text-purple-400 mt-1">
              You own {((Number(verification.userBalance) / Number(verification.tokenTotalSupply)) * 100).toFixed(4)}% of the NFT
            </p>
          </div>
        </div>

        {/* Add to MetaMask */}
        <div className="pt-3 border-t border-gray-700">
          <button
            onClick={async () => {
              try {
                await window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: fractionalTokenAddress,
                      symbol: verification.tokenSymbol || 'FRACT',
                      decimals: 18,
                      image: ''
                    }
                  }
                });
              } catch (error) {
                console.error('Error adding token to MetaMask:', error);
                alert(`Error: ${error.message}`);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all border-2 border-orange-400"
          >
            Add Token to MetaMask
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Token: {verification.tokenName} ({verification.tokenSymbol})
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenVerifier;

