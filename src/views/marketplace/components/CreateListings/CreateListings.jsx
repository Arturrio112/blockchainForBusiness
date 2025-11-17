import { useState } from "react";

const CreateListing = ({
    fractionalizedNFTs,
    account,
    selectedToken,
    setSelectedToken,
    listingAmount,
    setListingAmount,
    pricePerToken,
    setPricePerToken,
    handleCreateListing,
    isLoading,
}) => {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-cyan-400 mb-6">
                    CREATE NEW LISTING
                </h2>

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
                                .filter((nft) => Number(nft.balance) > 0)
                                .map((nft) => (
                                    <option
                                        key={nft.address}
                                        value={nft.address}
                                    >
                                        {nft.name} ({nft.symbol}) - Balance:{" "}
                                        {nft.balance}
                                    </option>
                                ))}
                        </select>
                        {fractionalizedNFTs.filter(
                            (nft) => Number(nft.balance) > 0
                        ).length === 0 && (
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
                                <span className="text-gray-300">
                                    Total Value:
                                </span>
                                <span className="text-cyan-400 font-bold">
                                    {(
                                        Number(listingAmount) *
                                        Number(pricePerToken)
                                    ).toFixed(6)}{" "}
                                    ETH
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">
                                    Trading Fee (0.5%):
                                </span>
                                <span className="text-gray-400 text-sm">
                                    {(
                                        Number(listingAmount) *
                                        Number(pricePerToken) *
                                        0.005
                                    ).toFixed(6)}{" "}
                                    ETH
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleCreateListing}
                        disabled={
                            isLoading ||
                            !selectedToken ||
                            !listingAmount ||
                            !pricePerToken
                        }
                        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-300"
                    >
                        {isLoading ? "CREATING..." : "CREATE LISTING"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;
