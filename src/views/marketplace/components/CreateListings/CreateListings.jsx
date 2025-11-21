const CreateListings = ({
    fractionalizedNFTs,
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
                    {/* Token Select */}
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
                                        {nft.name} ({nft.symbol}) — Balance:{" "}
                                        {nft.balance}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                            Amount to Sell
                        </label>
                        <input
                            type="number"
                            value={listingAmount}
                            onChange={(e) => setListingAmount(e.target.value)}
                            placeholder="e.g., 1000"
                            className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                            Price per Token (ETH)
                        </label>
                        <input
                            type="text"
                            value={pricePerToken}
                            onChange={(e) => setPricePerToken(e.target.value)}
                            placeholder="e.g., 0.001"
                            className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    {/* Summary */}
                    {listingAmount && pricePerToken && (
                        <div className="p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg">
                            <div className="flex justify-between mb-2">
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
                        </div>
                    )}

                    {/* Button */}
                    <button
                        onClick={handleCreateListing}
                        disabled={
                            isLoading ||
                            !selectedToken ||
                            !listingAmount ||
                            !pricePerToken
                        }
                        className="cursor-pointer w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-xl disabled:opacity-50"
                    >
                        {isLoading ? "CREATING..." : "CREATE LISTING"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateListings;
