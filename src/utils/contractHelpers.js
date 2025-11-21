import { ethers } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersProvider';
// Import compiled ABIs from Hardhat artifacts
import NFTFractionalizationArtifact from '../../artifacts/contracts/NFTFractionalization.sol/NFTFractionalization.json';
import FractionalMarketplaceArtifact from '../../artifacts/contracts/FractionalMarketplace.sol/FractionalMarketplace.json';
import MockNFTArtifact from '../../artifacts/contracts/MockNFT.sol/MockNFT.json';
import FractionalTokenArtifact from '../../artifacts/contracts/NFTFractionalization.sol/FractionalToken.json';

export const getContract = (address, abi, signerOrProvider) => {
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const getFractionalizationContract = (address, signer) => {
  return getContract(address, NFTFractionalizationArtifact.abi, signer);
};

export const getMarketplaceContract = (address, signer) => {
  return getContract(address, FractionalMarketplaceArtifact.abi, signer);
};

export const getMockNFTContract = (address, signer) => {
  return getContract(address, MockNFTArtifact.abi, signer);
};

export const getFractionalTokenContract = (address, signerOrProvider) => {
  return getContract(address, FractionalTokenArtifact.abi, signerOrProvider);
};

export const formatEther = (value) => {
  try {
    return ethers.formatEther(value);
  } catch (err) {
    return '0';
  }
};

export const parseEther = (value) => {
  try {
    return ethers.parseEther(value.toString());
  } catch (err) {
    return ethers.parseEther('0');
  }
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const calculateFee = (amount, feePercentage) => {
  const FEE_DENOMINATOR = 10000;
  return (BigInt(amount) * BigInt(feePercentage)) / BigInt(FEE_DENOMINATOR);
};

export const formatTokenAmount = (amount, decimals = 18) => {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (err) {
    return '0';
  }
};

export const parseTokenAmount = (amount, decimals = 18) => {
  try {
    return ethers.parseUnits(amount.toString(), decimals);
  } catch (err) {
    return BigInt(0);
  }
};

export const waitForTransaction = async (tx) => {
  const receipt = await tx.wait();
  return receipt;
};

export const handleContractError = (error) => {
  console.error('Contract error:', error);
  
  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected by user';
  }
  
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An error occurred. Please try again.';
};

export const redeemNft = async (
  fractionalizationContract,
  fractionalTokenAddress,
  signer
) => {
  try {
    const token = getFractionalTokenContract(fractionalTokenAddress, signer);

    const totalSupply = await token.totalSupply();

    const approveTx = await token.approve(
      fractionalizationContract.target,
      totalSupply
    );
    await approveTx.wait();

    const tx = await fractionalizationContract.redeemNFT(
      fractionalTokenAddress
    );

    const receipt = await tx.wait();
    return receipt;

  } catch (error) {
    throw new Error(handleContractError(error));
  }
};
export const cancelListing = async (
  marketplaceAddress,
  listingId,
  signer
) => {
  try {
    const marketplace = getMarketplaceContract(marketplaceAddress, signer);

    const tx = await marketplace.cancelListing(listingId);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(handleContractError(error));
  }
};

