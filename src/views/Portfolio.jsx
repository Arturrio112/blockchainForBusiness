import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import { useEthersProvider } from '../hooks/useEthersProvider';
import {
  getFractionalizationContract,
  getFractionalTokenContract,
  handleContractError,
  shortenAddress
} from '../utils/contractHelpers';

const Portfolio = () => {
  const { address: account, isConnected } = useAccount();
  const { contracts } = useContracts();
  const provider = useEthersProvider();
  
  const [holdings, setHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (isConnected && contracts.fractionalization && provider) {
      loadPortfolio();
    }
  }, [isConnected, contracts.fractionalization, account, provider]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      
      // Check if provider is ready
      if (!provider) {
        console.log('Provider not ready yet');
        setIsLoading(false);
        return;
      }

      const fractionalizationContract = getFractionalizationContract(
        contracts.fractionalization,
        provider
      );
      
      // Try to get fractionalized NFTs, handle empty case
      let tokenAddresses = [];
      try {
        tokenAddresses = await fractionalizationContract.getAllFractionalizedNFTs();
      } catch (error) {
        // If we get BAD_DATA error, it likely means no NFTs have been fractionalized yet
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
          console.log('No fractionalized NFTs found yet');
          setHoldings([]);
          setTotalValue(0);
          setIsLoading(false);
          return;
        }
        throw error; // Re-throw other errors
      }
      
      const holdingsData = [];
      let calculatedTotalValue = 0;
      
      for (const tokenAddr of tokenAddresses) {
        try {
          const tokenContract = getFractionalTokenContract(tokenAddr, provider);
          const balance = await tokenContract.balanceOf(account);
          
          if (balance > 0) {
            const name = await tokenContract.name();
            const symbol = await tokenContract.symbol();
            const totalSupply = await tokenContract.totalSupply();
            const nftInfo = await fractionalizationContract.getFractionalizedNFT(tokenAddr);
            
            const ownershipPercentage = (Number(balance) / Number(totalSupply)) * 100;
            
            holdingsData.push({
              address: tokenAddr,
              name,
              symbol,
              balance: balance.toString(),
              totalSupply: totalSupply.toString(),
              ownershipPercentage: ownershipPercentage.toFixed(4),
              nftContract: nftInfo.nftContract,
              tokenId: nftInfo.tokenId.toString(),
              isActive: nftInfo.isActive
            });
            
            // Simple value calculation (could be enhanced with price data)
            calculatedTotalValue += Number(balance);
          }
        } catch (err) {
          console.error('Error loading token info:', err);
        }
      }
      
      setHoldings(holdingsData);
      setTotalValue(calculatedTotalValue);
    } catch (err) {
      console.error('Error loading portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <h2 className="text-3xl font-black text-cyan-400 mb-4">WALLET NOT CONNECTED</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            YOUR PORTFOLIO
          </h1>
          <p className="text-gray-300 text-lg">
            Track your fractional NFT holdings
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-400 uppercase font-semibold mb-2">
              Connected Wallet
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {shortenAddress(account)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-400 uppercase font-semibold mb-2">
              Total Holdings
            </div>
            <div className="text-2xl font-black text-purple-400">
              {holdings.length} {holdings.length === 1 ? 'Asset' : 'Assets'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-blue-500 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-400 uppercase font-semibold mb-2">
              Total Tokens
            </div>
            <div className="text-2xl font-black text-blue-400">
              {totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Holdings List */}
        {isLoading ? (
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-2xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <h3 className="text-2xl font-black text-gray-400 mb-4">LOADING PORTFOLIO...</h3>
          </div>
        ) : holdings.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-2xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">📂</div>
            <h3 className="text-2xl font-black text-gray-400 mb-4">NO HOLDINGS YET</h3>
            <p className="text-gray-500 mb-8">
              Start by buying fractional tokens in the marketplace or fractionalizing your own NFTs
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/marketplace"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-sm transition-all duration-200 shadow-xl shadow-cyan-500/50 border-2 border-cyan-300"
              >
                BROWSE MARKETPLACE
              </a>
              <a
                href="/fractionalize"
                className="px-6 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-cyan-400 font-black text-sm transition-all duration-200 border-2 border-cyan-400"
              >
                FRACTIONALIZE NFT
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {holdings.map((holding) => (
              <div
                key={holding.address}
                className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Token Info */}
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-black text-cyan-400">
                        {holding.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500 text-purple-300 text-sm font-bold">
                        {holding.symbol}
                      </span>
                      {holding.isActive && (
                        <span className="px-3 py-1 rounded-full bg-green-900/50 border border-green-500 text-green-300 text-xs font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        Original NFT: <span className="text-purple-400 font-mono">{shortenAddress(holding.nftContract)}</span> #{holding.tokenId}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        Token: {holding.address}
                      </p>
                    </div>
                  </div>

                  {/* Holdings Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center md:text-right">
                      <div className="text-sm text-gray-400 uppercase font-semibold mb-1">
                        Your Balance
                      </div>
                      <div className="text-2xl font-black text-cyan-400">
                        {Number(holding.balance).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        tokens
                      </div>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="text-sm text-gray-400 uppercase font-semibold mb-1">
                        Ownership
                      </div>
                      <div className="text-2xl font-black text-purple-400">
                        {holding.ownershipPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        of {Number(holding.totalSupply).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(holding.ownershipPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => window.location.href = '/marketplace'}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm transition-all shadow-lg border-2 border-green-400"
                  >
                    SELL TOKENS
                  </button>
                  {Number(holding.ownershipPercentage) === 100 && holding.isActive && (
                    <button
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-lg border-2 border-purple-400"
                    >
                      REDEEM NFT
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {holdings.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadPortfolio}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-cyan-400 font-black text-sm transition-all duration-200 border-2 border-cyan-400 disabled:opacity-50"
            >
              {isLoading ? 'REFRESHING...' : 'REFRESH PORTFOLIO'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

