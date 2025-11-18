import { formatEther, shortenAddress } from "../../../../utils/contractHelpers";

const BrowseListings = ({
    listings,
    account,
    buyingListingId,
    buyAmount,
    setBuyAmount,
    setBuyingListingId,
    handleBuyTokens,
    isLoading,
}) => {
    return (
        <div>
            {listings.length === 0 ? (
                <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-2xl p-12 text-center shadow-2xl">
                    <h3 className="text-2xl font-black text-gray-400 mb-4">
                        NO LISTINGS AVAILABLE
                    </h3>
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
                            {/* Header */}
                            <div className="mb-4">
                                <h3 className="text-xl font-black text-cyan-400 mb-2">
                                    {listing.tokenName}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Symbol:{" "}
                                    <span className="text-purple-400">
                                        {listing.tokenSymbol}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Seller: {shortenAddress(listing.seller)}
                                </p>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">
                                        Available:
                                    </span>
                                    <span className="text-cyan-400 font-bold">
                                        {listing.amount} tokens
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">
                                        Price per token:
                                    </span>
                                    <span className="text-cyan-400 font-bold">
                                        {formatEther(listing.pricePerToken)} ETH
                                    </span>
                                </div>
                            </div>

                            {/* Buy UI */}
                            {buyingListingId === listing.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        value={buyAmount}
                                        onChange={(e) =>
                                            setBuyAmount(e.target.value)
                                        }
                                        placeholder="Amount to buy"
                                        max={listing.amount}
                                        className="w-full px-3 py-2 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setBuyingListingId(null);
                                                setBuyAmount("");
                                            }}
                                            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-all"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleBuyTokens(
                                                    listing.id,
                                                    buyAmount,
                                                    listing.pricePerToken
                                                )
                                            }
                                            disabled={isLoading || !buyAmount}
                                            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold text-sm transition-all shadow-lg disabled:opacity-50"
                                        >
                                            {isLoading
                                                ? "BUYING..."
                                                : "CONFIRM"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        setBuyingListingId(listing.id)
                                    }
                                    disabled={
                                        listing.seller.toLowerCase() ===
                                        account.toLowerCase()
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black text-sm transition-all shadow-lg disabled:opacity-50"
                                >
                                    {listing.seller.toLowerCase() ===
                                    account.toLowerCase()
                                        ? "YOUR LISTING"
                                        : "BUY TOKENS"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseListings;
