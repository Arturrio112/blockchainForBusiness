import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../../hooks/useContracts";
import {
    useEthersProvider,
    useEthersSigner,
} from "../../hooks/useEthersProvider";
import TokenVerifier from "../../components/TokenVerifier";
import {
    calculateFractionalizationFee,
    getFixedFeeUSD,
} from "../../utils/priceService";
import {
    getMockNFTContract,
    getFractionalizationContract,
    parseEther,
    formatEther,
    handleContractError,
    waitForTransaction,
} from "../../utils/contractHelpers";

const Fractionalize = () => {
    const { address: account, isConnected } = useAccount();
    const { contracts } = useContracts();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    const [step, setStep] = useState(0); // 0: Select NFT, 1: Mint NFT, 2: Fractionalize
    const [nftTokenId, setNftTokenId] = useState(null);
    const [nftUri, setNftUri] = useState("");
    const [ownedNFTs, setOwnedNFTs] = useState([]);
    const [loadingNFTs, setLoadingNFTs] = useState(false);

    const [fractionalName, setFractionalName] = useState("");
    const [fractionalSymbol, setFractionalSymbol] = useState("");
    const [totalSupply, setTotalSupply] = useState("");
    const [fractionalTokenAddress, setFractionalTokenAddress] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Price-based fee state
    const [feeInfo, setFeeInfo] = useState(null);
    const [loadingFee, setLoadingFee] = useState(false);

    // Load owned NFTs on mount
    useEffect(() => {
        if (isConnected && contracts.mockNFT && provider) {
            loadOwnedNFTs();
        }
    }, [isConnected, contracts.mockNFT, account]);

    const loadOwnedNFTs = async () => {
        try {
            setLoadingNFTs(true);
            const nftContract = getMockNFTContract(contracts.mockNFT, provider);
            const balance = await nftContract.balanceOf(account);

            const nfts = [];
            // Note: This is simplified - a real implementation would need token enumeration
            // For now, we'll just check token IDs 0-9
            for (let i = 0; i < 10; i++) {
                try {
                    const owner = await nftContract.ownerOf(i);
                    if (owner.toLowerCase() === account.toLowerCase()) {
                        const uri = await nftContract.tokenURI(i);
                        nfts.push({ tokenId: i, uri });
                    }
                } catch (e) {
                    // Token doesn't exist, skip
                }
            }

            setOwnedNFTs(nfts);
        } catch (error) {
            console.error("Error loading NFTs:", error);
        } finally {
            setLoadingNFTs(false);
        }
    };

    const resetTransactionState = () => {
        setError("");
        setSuccess("");
        setTxHash("");
        setFractionalTokenAddress("");
        setFractionalName("");
        setFractionalSymbol("");
        setTotalSupply("");
    };

    // Fetch current ETH price and calculate fee when user reaches step 2
    useEffect(() => {
        if (step === 2) {
            fetchFeeInfo();
        }
    }, [step]);

    const fetchFeeInfo = async () => {
        try {
            setLoadingFee(true);
            const fee = await calculateFractionalizationFee();
            setFeeInfo(fee);
            console.log("Fee calculated:", fee);
        } catch (error) {
            console.error("Error fetching fee:", error);
            setError("Could not fetch ETH price. Using fallback.");
            // Fallback values
            setFeeInfo({
                feeInEth: "0.002500",
                ethPriceUSD: "2000.00",
                feeInUSD: getFixedFeeUSD(),
            });
        } finally {
            setLoadingFee(false);
        }
    };

    const handleMintNFT = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (!nftUri.trim()) {
            setError("Please enter an NFT URI/metadata");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSuccess("");

            const mockNFTContract = getMockNFTContract(
                contracts.mockNFT,
                signer
            );

            // Mint NFT - the function returns the token ID
            const tx = await mockNFTContract.mint(account, nftUri);
            setTxHash(tx.hash);
            setSuccess("Minting NFT... Please wait for confirmation");

            const receipt = await waitForTransaction(tx);

            // Get the token ID from the receipt
            // The mint function emits a Transfer event with the tokenId
            let tokenId = null;

            // Try to parse Transfer event
            for (const log of receipt.logs) {
                try {
                    const parsed = mockNFTContract.interface.parseLog({
                        topics: [...log.topics],
                        data: log.data,
                    });

                    if (parsed && parsed.name === "Transfer") {
                        tokenId = parsed.args.tokenId.toString();
                        break;
                    }
                } catch (e) {
                    // Not a Transfer event or parsing failed, continue
                    continue;
                }
            }

            // Fallback: get the balance to determine token ID
            if (!tokenId) {
                const balance = await mockNFTContract.balanceOf(account);
                tokenId = (Number(balance) - 1).toString(); // Last minted token
            }

            console.log("Minted NFT Token ID:", tokenId);
            setNftTokenId(tokenId);
            setSuccess(`NFT minted successfully! Token ID: ${tokenId}`);
            setStep(2);
        } catch (err) {
            setError(handleContractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFractionalize = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (
            !fractionalName.trim() ||
            !fractionalSymbol.trim() ||
            !totalSupply
        ) {
            setError("Please fill in all fields");
            return;
        }

        if (Number(totalSupply) <= 0) {
            setError("Total supply must be greater than 0");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSuccess("");

            const mockNFTContract = getMockNFTContract(
                contracts.mockNFT,
                signer
            );
            const fractionalizationContract = getFractionalizationContract(
                contracts.fractionalization,
                signer
            );

            // Fetch latest fee before transaction
            setSuccess("Fetching current ETH price...");
            const latestFee = await calculateFractionalizationFee();
            const feeInWei = parseEther(latestFee.feeInEth);

            // Approve NFT transfer
            setSuccess(
                `Step 1/3: Approving NFT transfer... (Fee: $${latestFee.feeInUSD} = ${latestFee.feeInEth} ETH)`
            );
            const approveTx = await mockNFTContract.approve(
                contracts.fractionalization,
                nftTokenId
            );
            await waitForTransaction(approveTx);

            // Fractionalize NFT
            setSuccess(
                `Step 2/3: Fractionalizing NFT... (Sending ${latestFee.feeInEth} ETH fee)`
            );
            const tx = await fractionalizationContract.fractionalizeNFT(
                contracts.mockNFT,
                nftTokenId,
                fractionalName,
                fractionalSymbol,
                parseEther(totalSupply),
                { value: feeInWei }
            );
            setTxHash(tx.hash);

            setSuccess("Step 3/3: Confirming transaction...");
            const receipt = await waitForTransaction(tx);

            // Extract fractional token address from event
            let fractionalAddr = null;
            for (const log of receipt.logs) {
                try {
                    const parsed = fractionalizationContract.interface.parseLog(
                        {
                            topics: [...log.topics],
                            data: log.data,
                        }
                    );

                    if (parsed && parsed.name === "NFTFractionalized") {
                        fractionalAddr = parsed.args.fractionalToken;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (fractionalAddr) {
                setFractionalTokenAddress(fractionalAddr);
            }

            setSuccess(
                `NFT fractionalized successfully! You now have ${totalSupply} fractional tokens in your wallet.`
            );

            // Don't auto-reset - let user see verification
            // They can manually go back to step 0 if needed
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
                    <h2 className="text-3xl font-black text-cyan-400 mb-4">
                        WALLET NOT CONNECTED
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Please connect your wallet to fractionalize NFTs
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                        FRACTIONALIZE YOUR NFT
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Split your NFT into tradeable fractional tokens
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    <div
                        className={`flex items-center ${
                            step >= 0 ? "text-cyan-400" : "text-gray-600"
                        }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 ${
                                step >= 0
                                    ? "bg-cyan-500 border-cyan-300 text-black"
                                    : "border-gray-600"
                            }`}
                        >
                            1
                        </div>
                        <span className="ml-3 font-bold text-sm">
                            Select NFT
                        </span>
                    </div>

                    <div
                        className={`w-16 h-1 mx-2 ${
                            step >= 1 ? "bg-cyan-500" : "bg-gray-700"
                        }`}
                    ></div>

                    <div
                        className={`flex items-center ${
                            step >= 1 ? "text-cyan-400" : "text-gray-600"
                        }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 ${
                                step >= 1
                                    ? "bg-cyan-500 border-cyan-300 text-black"
                                    : "border-gray-600"
                            }`}
                        >
                            2
                        </div>
                        <span className="ml-3 font-bold text-sm">
                            Mint/Load
                        </span>
                    </div>

                    <div
                        className={`w-16 h-1 mx-2 ${
                            step >= 2 ? "bg-cyan-500" : "bg-gray-700"
                        }`}
                    ></div>

                    <div
                        className={`flex items-center ${
                            step >= 2 ? "text-cyan-400" : "text-gray-600"
                        }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 ${
                                step >= 2
                                    ? "bg-cyan-500 border-cyan-300 text-black"
                                    : "border-gray-600"
                            }`}
                        >
                            3
                        </div>
                        <span className="ml-3 font-bold text-sm">
                            Fractionalize
                        </span>
                    </div>
                </div>

                {/* Step 0: Select or Mint NFT */}
                {step === 0 && (
                    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-cyan-400 mb-6">
                            STEP 1: SELECT YOUR NFT
                        </h2>

                        {loadingNFTs ? (
                            <div className="text-center py-12">
                                <p className="text-gray-300 animate-pulse">
                                    Loading your NFTs...
                                </p>
                            </div>
                        ) : ownedNFTs.length > 0 ? (
                            <div>
                                <p className="text-gray-300 mb-6">
                                    Select an NFT you own to fractionalize:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {ownedNFTs.map((nft) => (
                                        <div
                                            key={nft.tokenId}
                                            onClick={() => {
                                                setNftTokenId(
                                                    nft.tokenId.toString()
                                                );
                                                setStep(2);
                                            }}
                                            className="p-4 bg-slate-800/50 border-2 border-purple-500 hover:border-cyan-500 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-1">
                                                    <p className="font-bold text-cyan-400">
                                                        Token #{nft.tokenId}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {nft.uri}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-300 mb-6">
                                    You don't own any NFTs yet. Mint one first!
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => setStep(1)}
                            className="cursor-pointer w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg transition-all duration-200 shadow-xl border-2 border-purple-400"
                        >
                            OR MINT NEW NFT
                        </button>
                    </div>
                )}

                {/* Step 1: Mint NFT */}
                {step === 1 && (
                    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-cyan-400 mb-6">
                            STEP 1: MINT A TEST NFT
                        </h2>
                        <p className="text-gray-300 mb-6">
                            For testing purposes, mint a mock NFT that you can
                            then fractionalize.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                                    NFT Metadata URI
                                </label>
                                <input
                                    type="text"
                                    value={nftUri}
                                    onChange={(e) => setNftUri(e.target.value)}
                                    placeholder="ipfs://... or https://..."
                                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter any URI or text for testing (e.g., "My
                                    Test NFT #1")
                                </p>
                            </div>

                            <button
                                onClick={handleMintNFT}
                                disabled={isLoading || !nftUri.trim()}
                                className="cursor-pointer w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-300"
                            >
                                {isLoading ? "MINTING..." : "MINT NFT"}
                            </button>

                            {/* Manual skip button in case of issues */}
                            <div className="text-center pt-4 border-t border-gray-700">
                                <p className="text-xs text-gray-400 mb-2">
                                    Already minted? Enter your Token ID:
                                </p>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Token ID (e.g., 0)"
                                        className="flex-1 px-4 py-2 bg-slate-800/50 border-2 border-gray-600 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                        onChange={(e) =>
                                            setNftTokenId(e.target.value)
                                        }
                                    />
                                    <button
                                        onClick={() => {
                                            if (nftTokenId) {
                                                setSuccess(
                                                    `Using Token ID: ${nftTokenId}`
                                                );
                                                setStep(2);
                                            } else {
                                                setError(
                                                    "Please enter a Token ID"
                                                );
                                            }
                                        }}
                                        className="cursor-pointer px-6 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 text-cyan-400 font-bold text-sm transition-all border-2 border-cyan-400"
                                    >
                                        SKIP TO FRACTIONALIZE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Fractionalize */}
                {step === 2 && (
                    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-cyan-400 mb-6">
                            STEP 2: FRACTIONALIZE NFT
                        </h2>

                        <div className="mb-6 p-4 bg-green-900/30 border-2 border-green-500 rounded-lg">
                            <p className="text-green-300 font-semibold">
                                NFT Token ID:{" "}
                                <span className="text-cyan-400">
                                    #{nftTokenId}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                                    Fractional Token Name
                                </label>
                                <input
                                    type="text"
                                    value={fractionalName}
                                    onChange={(e) =>
                                        setFractionalName(e.target.value)
                                    }
                                    placeholder="e.g., Fractionalized CryptoPunk #1234"
                                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                                    Fractional Token Symbol
                                </label>
                                <input
                                    type="text"
                                    value={fractionalSymbol}
                                    onChange={(e) =>
                                        setFractionalSymbol(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g., FPUNK1234"
                                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase">
                                    Total Supply of Fractions
                                </label>
                                <input
                                    type="number"
                                    value={totalSupply}
                                    onChange={(e) =>
                                        setTotalSupply(e.target.value)
                                    }
                                    placeholder="e.g., 1000000"
                                    className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    How many fractional tokens to create
                                </p>
                            </div>

                            {/* Fee Display */}
                            {feeInfo ? (
                                <div className="p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">
                                            Platform Fee:
                                        </span>
                                        <span className="text-yellow-400 font-black text-lg">
                                            {feeInfo.feeInEth} ETH
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg text-center">
                                    <span className="text-gray-400 text-sm">
                                        Loading fee information...
                                    </span>
                                </div>
                            )}

                            {totalSupply && (
                                <div className="p-4 bg-purple-900/30 border-2 border-purple-500 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">
                                            You will receive:
                                        </span>
                                        <span className="text-cyan-400 font-bold text-lg">
                                            {Number(
                                                totalSupply
                                            ).toLocaleString()}{" "}
                                            tokens
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        All fractional tokens go to your wallet
                                        (no fee deduction from supply)
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => [resetTransactionState(), setStep(1)]}
                                    className="cursor-pointer flex-1 px-6 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-black text-lg transition-all duration-200 border-2 border-gray-500"
                                >
                                    BACK
                                </button>
                                <button
                                    onClick={handleFractionalize}
                                    disabled={
                                        isLoading ||
                                        !fractionalName.trim() ||
                                        !fractionalSymbol.trim() ||
                                        !totalSupply
                                    }
                                    className="cursor-pointer flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-300"
                                >
                                    {isLoading
                                        ? "PROCESSING..."
                                        : "FRACTIONALIZE"}
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
                        <p className="text-green-300 font-semibold">
                            {success}
                        </p>
                        {txHash && (
                            <p className="text-xs text-gray-400 mt-2">
                                Transaction: {txHash}
                            </p>
                        )}
                    </div>
                )}

                {/* Token Verification Component */}
                {fractionalTokenAddress && step === 2 && (
                    <TokenVerifier
                        fractionalTokenAddress={fractionalTokenAddress}
                        nftAddress={contracts.mockNFT}
                        tokenId={nftTokenId}
                    />
                )}
            </div>
        </div>
    );
};

export default Fractionalize;
