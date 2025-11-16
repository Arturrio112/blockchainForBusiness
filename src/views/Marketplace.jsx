import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import { useEthersProvider, useEthersSigner } from '../hooks/useEthersProvider';
import {
  getMarketplaceContract,
  getFractionalTokenContract,
  getFractionalizationContract,
  parseEther,
  formatEther,
  handleContractError,
  waitForTransaction,
  shortenAddress
} from '../utils/contractHelpers';

const Marketplace = () => {
  const { address: account, isConnected } = useAccount();
  const { contracts } = useContracts();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'create'
  const [listings, setListings] = useState([]);
  const [fractionalizedNFTs, setFractionalizedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create listing form
  const [selectedToken, setSelectedToken] = useState('');
  const [listingAmount, setListingAmount] = useState('');
  const [pricePerToken, setPricePerToken] = useState('');

  // Buy form
  const [buyingListingId, setBuyingListingId] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');

  useEffect(() => {
    if (isConnected && contracts.marketplace && provider) {
      loadListings();
      loadFractionalizedNFTs();
    }
  }, [isConnected, contracts.marketplace, provider]);

  const loadListings = async () => {
    try {
      if (!provider) {
        console.log('Provider not ready yet');
        return;
      }

      const marketplaceContract = getMarketplaceContract(
        contracts.marketplace,
        provider
      );
      
      let result;
      try {
        result = await marketplaceContract.getActiveListings(50);
      } catch (error) {
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
          console.log('No active listings yet');
          setListings([]);
          return;
        }
        throw error;
      }
      
      const [listingIds, sellers, tokens, amounts, prices] = result;
      
      const listingsData = [];
      for (let i = 0; i < listingIds.length; i++) {
        // Get token info
        let tokenName = 'Unknown';
        let tokenSymbol = 'UNKNOWN';
        try {
          const tokenContract = getFractionalTokenContract(tokens[i], provider);
          tokenName = await tokenContract.name();
          tokenSymbol = await tokenContract.symbol();
        } catch (err) {
          console.error('Error loading token info:', err);
        }

        listingsData.push({
          id: listingIds[i].toString(),
          seller: sellers[i],
          token: tokens[i],
          tokenName,
          tokenSymbol,
          amount: amounts[i].toString(),
          pricePerToken: prices[i].toString(),
          totalPrice: (BigInt(amounts[i]) * BigInt(prices[i])).toString()
        });
      }
      
      setListings(listingsData);
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  const loadFractionalizedNFTs = async () => {
    try {
      if (!provider) {
        console.log('Provider not ready yet');
        return;
      }

      const fractionalizationContract = getFractionalizationContract(
        contracts.fractionalization,
        provider
      );
      
      let tokenAddresses = [];
      try {
        tokenAddresses = await fractionalizationContract.getAllFractionalizedNFTs();
      } catch (error) {
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
          console.log('No fractionalized NFTs found yet');
          setFractionalizedNFTs([]);
          return;
        }
        throw error;
      }
      
      const nftsData = [];
      for (const tokenAddr of tokenAddresses) {
        try {
          const nftInfo = await fractionalizationContract.getFractionalizedNFT(tokenAddr);
          const tokenContract = getFractionalTokenContract(tokenAddr, provider);
          
          const name = await tokenContract.name();
          const symbol = await tokenContract.symbol();
          const balance = account ? await tokenContract.balanceOf(account) : 0;
          
          nftsData.push({
            address: tokenAddr,
            name,
            symbol,
            totalSupply: nftInfo.totalSupply.toString(),
            isActive: nftInfo.isActive,
            balance: balance.toString()
          });
        } catch (err) {
          console.error('Error loading NFT info:', err);
        }
      }
      
      setFractionalizedNFTs(nftsData);
    } catch (err) {
      console.error('Error loading fractionalized NFTs:', err);
    }
  };

  const handleCreateListing = async () => {
    if (!selectedToken || !listingAmount || !pricePerToken) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const tokenContract = getFractionalTokenContract(selectedToken, signer);
      const marketplaceContract = getMarketplaceContract(contracts.marketplace, signer);

      // Approve tokens
      setSuccess('Step 1/2: Approving tokens...');
      const approveTx = await tokenContract.approve(
        contracts.marketplace,
        listingAmount
      );
      await waitForTransaction(approveTx);

      // Create listing
      setSuccess('Step 2/2: Creating listing...');
      const priceInWei = parseEther(pricePerToken);
      const tx = await marketplaceContract.createListing(
        selectedToken,
        listingAmount,
        priceInWei
      );
      await waitForTransaction(tx);

      setSuccess('Listing created successfully!');
      setSelectedToken('');
      setListingAmount('');
      setPricePerToken('');
      
      // Reload listings
      setTimeout(() => {
        loadListings();
        loadFractionalizedNFTs();
      }, 2000);
    } catch (err) {
      setError(handleContractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTokens = async (listingId, amount, pricePerToken) => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const marketplaceContract = getMarketplaceContract(contracts.marketplace, signer);
      
      const totalPrice = BigInt(amount) * BigInt(pricePerToken);
      const tradingFee = (totalPrice * BigInt(50)) / BigInt(10000); // 0.5% fee
      const totalCost = totalPrice;

      const tx = await marketplaceContract.purchaseTokens(
        listingId,
        amount,
        { value: totalCost }
      );
      await waitForTransaction(tx);

      setSuccess('Tokens purchased successfully!');
      setBuyingListingId(null);
      setBuyAmount('');
      
      // Reload listings
      setTimeout(() => {
        loadListings();
        loadFractionalizedNFTs();
      }, 2000);
    } catch (err) {
      setError(handleContractError(err));
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
            Please connect your wallet to access the marketplace
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
            FRACTIONAL MARKETPLACE
          </h1>
          <p className="text-gray-300 text-lg">
            Buy and sell fractional NFT tokens
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-xl shadow-cyan-500/50 border-2 border-cyan-300'
                : 'bg-purple-900/50 text-cyan-400 border-2 border-purple-500 hover:bg-purple-800/50'
            }`}
          >
            BROWSE LISTINGS
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-xl shadow-cyan-500/50 border-2 border-cyan-300'
                : 'bg-purple-900/50 text-cyan-400 border-2 border-purple-500 hover:bg-purple-800/50'
            }`}
          >
            CREATE LISTING
          </button>
        </div>

        {/* Browse Listings */}
        {activeTab === 'browse' && (
          <div>
            {listings.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-2xl p-12 text-center shadow-2xl">
                <h3 className="text-2xl font-black text-gray-400 mb-4">NO LISTINGS AVAILABLE</h3>
                <p className="text-gray-500">
                  Be the first to create a listing!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-cyan-400 mb-2">
                        {listing.tokenName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Symbol: <span className="text-purple-400">{listing.tokenSymbol}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Seller: {shortenAddress(listing.seller)}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Available:</span>
                        <span className="text-cyan-400 font-bold">{listing.amount} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Price per token:</span>
                        <span className="text-cyan-400 font-bold">
                          {formatEther(listing.pricePerToken)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Total value:</span>
                        <span className="text-purple-400 font-bold">
                          {formatEther(listing.totalPrice)} ETH
                        </span>
                      </div>
                    </div>

                    {buyingListingId === listing.id ? (
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          placeholder="Amount to buy"
                          max={listing.amount}
                          className="w-full px-3 py-2 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setBuyingListingId(null);
                              setBuyAmount('');
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-all"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => handleBuyTokens(listing.id, buyAmount, listing.pricePerToken)}
                            disabled={isLoading || !buyAmount}
                            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold text-sm transition-all shadow-lg disabled:opacity-50"
                          >
                            {isLoading ? 'BUYING...' : 'CONFIRM'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setBuyingListingId(listing.id)}
                        disabled={listing.seller.toLowerCase() === account.toLowerCase()}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-300"
                      >
                        {listing.seller.toLowerCase() === account.toLowerCase() ? 'YOUR LISTING' : 'BUY TOKENS'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Listing */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-cyan-400 mb-6">CREATE NEW LISTING</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                    Select Fractional Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Choose a token...</option>
                    {fractionalizedNFTs
                      .filter(nft => Number(nft.balance) > 0)
                      .map(nft => (
                        <option key={nft.address} value={nft.address}>
                          {nft.name} ({nft.symbol}) - Balance: {nft.balance}
                        </option>
                      ))
                    }
                  </select>
                  {fractionalizedNFTs.filter(nft => Number(nft.balance) > 0).length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      You don't own any fractional tokens yet
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                    Amount to Sell
                  </label>
                  <input
                    type="number"
                    value={listingAmount}
                    onChange={(e) => setListingAmount(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                    Price per Token (ETH)
                  </label>
                  <input
                    type="text"
                    value={pricePerToken}
                    onChange={(e) => setPricePerToken(e.target.value)}
                    placeholder="e.g., 0.001"
                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {listingAmount && pricePerToken && (
                  <div className="p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Total Value:</span>
                      <span className="text-cyan-400 font-bold">
                        {(Number(listingAmount) * Number(pricePerToken)).toFixed(6)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Trading Fee (0.5%):</span>
                      <span className="text-gray-400 text-sm">
                        {(Number(listingAmount) * Number(pricePerToken) * 0.005).toFixed(6)} ETH
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreateListing}
                  disabled={isLoading || !selectedToken || !listingAmount || !pricePerToken}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-300"
                >
                  {isLoading ? 'CREATING...' : 'CREATE LISTING'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg">
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg">
            <p className="text-green-300 font-semibold">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

