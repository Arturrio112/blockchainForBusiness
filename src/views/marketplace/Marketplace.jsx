import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../../hooks/useContracts";
import {
    useEthersProvider,
    useEthersSigner,
} from "../../hooks/useEthersProvider";

import CreateListing from "./components/CreateListings/CreateListings";
import BrowseListings from "./components/BrowseListings/BrowseListings";

const Marketplace = () => {
    const { address: account, isConnected } = useAccount();
    const { contracts } = useContracts();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    const [activeTab, setActiveTab] = useState("browse");
    const [listings, setListings] = useState([]);
    const [fractionalizedNFTs, setFractionalizedNFTs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedToken, setSelectedToken] = useState("");
    const [listingAmount, setListingAmount] = useState("");
    const [pricePerToken, setPricePerToken] = useState("");

    useEffect(() => {
        if (isConnected && contracts.marketplace && provider) {
            // loadListings();
            // loadFractionalizedNFTs();
        }
    }, [isConnected, contracts.marketplace, provider]);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab("browse")}
                        className={`px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
                            activeTab === "browse"
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-xl shadow-cyan-500/50 border-2 border-cyan-300"
                                : "bg-purple-900/50 text-cyan-400 border-2 border-purple-500 hover:bg-purple-800/50"
                        }`}
                    >
                        BROWSE LISTINGS
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 ${
                            activeTab === "create"
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-xl shadow-cyan-500/50 border-2 border-cyan-300"
                                : "bg-purple-900/50 text-cyan-400 border-2 border-purple-500 hover:bg-purple-800/50"
                        }`}
                    >
                        CREATE LISTING
                    </button>
                </div>

                {activeTab === "browse" && (
                    <BrowseListings
                        listings={listings}
                        account={account}
                        handleBuyTokens={() => {}}
                        isLoading={isLoading}
                    />
                )}

                {activeTab === "create" && (
                    <CreateListing
                        fractionalizedNFTs={fractionalizedNFTs}
                        account={account}
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                        listingAmount={listingAmount}
                        setListingAmount={setListingAmount}
                        pricePerToken={pricePerToken}
                        setPricePerToken={setPricePerToken}
                        handleCreateListing={() => {}}
                        isLoading={isLoading}
                    />
                )}

                {/* Status messages */}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg">
                        <p className="text-red-300 font-semibold">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mt-6 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg">
                        <p className="text-green-300 font-semibold">
                            {success}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
