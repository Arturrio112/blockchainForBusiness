import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../../hooks/useContracts";
import {
    useEthersProvider,
    useEthersSigner,
} from "../../hooks/useEthersProvider";
import {
    getMarketplaceContract,
    getFractionalTokenContract,
    getFractionalizationContract,
    parseEther,
    cancelListing,
    handleContractError,
    waitForTransaction,
    formatEther,
} from "../../utils/contractHelpers";
import CreateListings from "./components/CreateListings/CreateListings";
import BrowseListings from "./components/BrowseListings/BrowseListings";

const Marketplace = () => {
    const { address: account, isConnected } = useAccount();
    const { contracts } = useContracts();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    const [activeTab, setActiveTab] = useState("browse"); // 'browse' or 'create'
    const [listings, setListings] = useState([]);
    const [fractionalizedNFTs, setFractionalizedNFTs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedToken, setSelectedToken] = useState("");
    const [listingAmount, setListingAmount] = useState("");
    const [pricePerToken, setPricePerToken] = useState("");

    const [buyingListingId, setBuyingListingId] = useState(null);
    const [buyAmount, setBuyAmount] = useState("");

    useEffect(() => {
        if (isConnected && contracts.marketplace && provider) {
            loadListings();
            loadFractionalizedNFTs();
        }
    }, [isConnected, contracts.marketplace, provider]);

    const loadListings = async () => {
        if (!provider) return;
        try {
            const marketplaceContract = getMarketplaceContract(contracts.marketplace, provider);
            let result;
            try {
                result = await marketplaceContract.getActiveListings(50);
            } catch (err) {
                if (err.code === "BAD_DATA" || err.message.includes("could not decode result data")) {
                    setListings([]);
                    return;
                }
                throw err;
            }

            const [listingIds, sellers, tokens, amounts, prices] = result;
            const listingsData = [];

            for (let i = 0; i < listingIds.length; i++) {
                let tokenName = "Unknown";
                let tokenSymbol = "UNKNOWN";
                try {
                    const tokenContract = getFractionalTokenContract(tokens[i], provider);
                    tokenName = await tokenContract.name();
                    tokenSymbol = await tokenContract.symbol();
                } catch {}
                listingsData.push({
                    id: listingIds[i].toString(),
                    seller: sellers[i],
                    token: tokens[i],
                    tokenName,
                    tokenSymbol,
                    amount: formatEther(amounts[i].toString()),
                    pricePerToken: prices[i].toString(),
                    totalPrice: (BigInt(amounts[i]) * BigInt(prices[i])).toString(),
                });
            }

            setListings(listingsData);
        } catch (err) {
            console.error(err);
        }
    };

    const loadFractionalizedNFTs = async () => {
        if (!provider) return;
        try {
            const fractionalizationContract = getFractionalizationContract(contracts.fractionalization, provider);
            let tokenAddresses = [];
            try {
                tokenAddresses = await fractionalizationContract.getAllFractionalizedNFTs();
            } catch (err) {
                if (err.code === "BAD_DATA" || err.message.includes("could not decode result data")) {
                    setFractionalizedNFTs([]);
                    return;
                }
                throw err;
            }

            const nftsData = [];
            for (const tokenAddr of tokenAddresses) {
                try {
                    const nftInfo = await fractionalizationContract.getFractionalizedNFT(tokenAddr);
                    const tokenContract = getFractionalTokenContract(tokenAddr, provider);
                    const name = await tokenContract.name();
                    const symbol = await tokenContract.symbol();
                    const balance = account ? formatEther(await tokenContract.balanceOf(account)) : 0;

                    nftsData.push({
                        address: tokenAddr,
                        name,
                        symbol,
                        totalSupply: formatEther(nftInfo.totalSupply.toString()),
                        isActive: nftInfo.isActive,
                        balance: balance.toString(),
                    });
                } catch {}
            }

            setFractionalizedNFTs(nftsData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateListing = async () => {
        if (!selectedToken || !listingAmount || !pricePerToken) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSuccess("");

            const tokenContract = getFractionalTokenContract(selectedToken, signer);
            const marketplaceContract = getMarketplaceContract(contracts.marketplace, signer);

            setSuccess("Step 1/2: Approving tokens...");
            const approveTx = await tokenContract.approve(contracts.marketplace, parseEther(listingAmount));
            await waitForTransaction(approveTx);

            setSuccess("Step 2/2: Creating listing...");
            const priceInWei = parseEther(pricePerToken);
            const tx = await marketplaceContract.createListing(selectedToken, parseEther(listingAmount), priceInWei);
            await waitForTransaction(tx);

            setSuccess("Listing created successfully!");
            setSelectedToken("");
            setListingAmount("");
            setPricePerToken("");

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
            setError("Please enter a valid amount");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSuccess("");

            const marketplaceContract = getMarketplaceContract(contracts.marketplace, signer);

            const totalPrice = BigInt(amount) * BigInt(pricePerToken);
            const totalCost = totalPrice;

            const tx = await marketplaceContract.purchaseTokens(listingId, amount, { value: totalCost });
            await waitForTransaction(tx);

            setSuccess("Tokens purchased successfully!");
            setBuyingListingId(null);
            setBuyAmount("");

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

    const handleCancelListing = async (listingId) => {
        try {
            setError("");
            setSuccess("");
            setIsLoading(true);

            if (!signer || !contracts.marketplace) {
                setError("Wallet not ready");
                return;
            }

            setSuccess("Cancelling listing...");
            await cancelListing(contracts.marketplace, listingId, signer);
            setSuccess("Listing cancelled!");

            setTimeout(() => loadListings(), 500);
        } catch (err) {
            setError(err.message || "Failed to cancel listing");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-pink-900/50 to-orange-900/50 backdrop-blur-sm border-2 border-orange-400 rounded-2xl p-12 text-center max-w-md shadow-2xl">
                    <h2 className="text-3xl font-black text-orange-400 mb-4">WALLET NOT CONNECTED</h2>
                    <p className="text-gray-300 mb-6">Please connect your wallet to access the marketplace</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 mb-4">
                        FRACTIONAL MARKETPLACE
                    </h1>
                    <p className="text-gray-300 text-lg">Buy and sell fractional NFT tokens</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab("browse")}
                        className={`cursor-pointer px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
                            activeTab === "browse"
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-black shadow-xl shadow-pink-500/50 border-2 border-orange-400"
                                : "bg-purple-900/50 text-orange-400 border-2 border-orange-500 hover:bg-purple-800/50"
                        }`}
                    >
                        BROWSE LISTINGS
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`cursor-pointer px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
                            activeTab === "create"
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-black shadow-xl shadow-pink-500/50 border-2 border-orange-400"
                                : "bg-purple-900/50 text-orange-400 border-2 border-orange-500 hover:bg-purple-800/50"
                        }`}
                    >
                        CREATE LISTING
                    </button>
                </div>

                {/* Browse Listings */}
                {activeTab === "browse" && (
                    <BrowseListings
                        listings={listings}
                        account={account}
                        buyingListingId={buyingListingId}
                        buyAmount={buyAmount}
                        setBuyAmount={setBuyAmount}
                        setBuyingListingId={setBuyingListingId}
                        handleBuyTokens={handleBuyTokens}
                        handleCancelListing={handleCancelListing}
                        isLoading={isLoading}
                    />
                )}

                {activeTab === "create" && (
                    <CreateListings
                        fractionalizedNFTs={fractionalizedNFTs}
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                        listingAmount={listingAmount}
                        setListingAmount={setListingAmount}
                        pricePerToken={pricePerToken}
                        setPricePerToken={setPricePerToken}
                        handleCreateListing={handleCreateListing}
                        isLoading={isLoading}
                    />
                )}

                {/* Status Messages */}
                {error && (
                    <div className="mt-6 p-4 bg-orange-900/50 border-2 border-orange-500 rounded-lg">
                        <p className="text-orange-300 font-semibold">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mt-6 p-4 bg-pink-900/50 border-2 border-pink-500 rounded-lg">
                        <p className="text-pink-300 font-semibold">{success}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
