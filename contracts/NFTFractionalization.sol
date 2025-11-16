// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTFractionalization
 * @dev Allows NFT owners to fractionalize their NFTs into ERC-20 tokens
 */
contract NFTFractionalization is ReentrancyGuard {
    struct FractionalizedNFT {
        address nftContract;
        uint256 tokenId;
        address fractionalToken;
        address originalOwner;
        uint256 totalSupply;
        uint256 fractionalizationFee;
        bool isActive;
    }

    // Mapping from fractional token address to FractionalizedNFT
    mapping(address => FractionalizedNFT) public fractionalizedNFTs;
    
    // Array of all fractionalized NFTs for browsing
    address[] public allFractionalTokens;
    
    // Platform owner (receives fees)
    address public platformOwner;
    
    // Events
    event NFTFractionalized(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed fractionalToken,
        address owner,
        uint256 totalSupply,
        uint256 fee
    );
    
    event NFTRedeemed(
        address indexed fractionalToken,
        address indexed redeemer
    );
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    /**
     * @dev Fractionalize an NFT into ERC-20 tokens
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID of the NFT
     * @param _name Name for the fractional token
     * @param _symbol Symbol for the fractional token
     * @param _totalSupply Total supply of fractional tokens to mint
     * Note: msg.value should contain the $5 equivalent in ETH (calculated off-chain)
     */
    function fractionalizeNFT(
        address _nftContract,
        uint256 _tokenId,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) external payable nonReentrant returns (address) {
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(msg.value > 0, "Fee required");
        
        // Fee is calculated off-chain
        uint256 fee = msg.value;
        
        // Transfer NFT to this contract
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        nft.transferFrom(msg.sender, address(this), _tokenId);
        
        // Create fractional token
        FractionalToken fractionalToken = new FractionalToken(
            _name,
            _symbol,
            _totalSupply,
            msg.sender
        );
        
        address fractionalTokenAddress = address(fractionalToken);
        
        // Store fractionalized NFT info
        fractionalizedNFTs[fractionalTokenAddress] = FractionalizedNFT({
            nftContract: _nftContract,
            tokenId: _tokenId,
            fractionalToken: fractionalTokenAddress,
            originalOwner: msg.sender,
            totalSupply: _totalSupply,
            fractionalizationFee: fee,
            isActive: true
        });
        
        allFractionalTokens.push(fractionalTokenAddress);
        
        // Transfer platform fee (all of msg.value)
        payable(platformOwner).transfer(fee);
        
        emit NFTFractionalized(
            _nftContract,
            _tokenId,
            fractionalTokenAddress,
            msg.sender,
            _totalSupply,
            fee
        );
        
        return fractionalTokenAddress;
    }
    
    /**
     * @dev Redeem NFT by burning all fractional tokens
     * @param _fractionalToken Address of the fractional token
     */
    function redeemNFT(address _fractionalToken) external nonReentrant {
        FractionalizedNFT storage fractionalizedNFT = fractionalizedNFTs[_fractionalToken];
        require(fractionalizedNFT.isActive, "NFT not fractionalized or already redeemed");
        
        FractionalToken token = FractionalToken(_fractionalToken);
        uint256 userBalance = token.balanceOf(msg.sender);
        
        require(userBalance == fractionalizedNFT.totalSupply, "Must own all fractional tokens");
        
        // Burn all tokens
        token.burnFrom(msg.sender, fractionalizedNFT.totalSupply);
        
        // Transfer NFT back to redeemer
        IERC721 nft = IERC721(fractionalizedNFT.nftContract);
        nft.transferFrom(address(this), msg.sender, fractionalizedNFT.tokenId);
        
        fractionalizedNFT.isActive = false;
        
        emit NFTRedeemed(_fractionalToken, msg.sender);
    }
    
    /**
     * @dev Get all fractionalized NFTs
     */
    function getAllFractionalizedNFTs() external view returns (address[] memory) {
        return allFractionalTokens;
    }
    
    /**
     * @dev Get fractionalized NFT details
     */
    function getFractionalizedNFT(address _fractionalToken) 
        external 
        view 
        returns (
            address nftContract,
            uint256 tokenId,
            address fractionalToken,
            address originalOwner,
            uint256 totalSupply,
            bool isActive
        ) 
    {
        FractionalizedNFT memory nft = fractionalizedNFTs[_fractionalToken];
        return (
            nft.nftContract,
            nft.tokenId,
            nft.fractionalToken,
            nft.originalOwner,
            nft.totalSupply,
            nft.isActive
        );
    }
    
    /**
     * @dev Update platform owner (only current owner)
     */
    function updatePlatformOwner(address _newOwner) external {
        require(msg.sender == platformOwner, "Only platform owner");
        require(_newOwner != address(0), "Invalid address");
        platformOwner = _newOwner;
    }
}

/**
 * @title FractionalToken
 * @dev ERC-20 token representing fractions of an NFT
 */
contract FractionalToken is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _recipient
    ) ERC20(_name, _symbol) {
        _mint(_recipient, _totalSupply);
    }
    
    /**
     * @dev Burn tokens from an account (used for redemption)
     */
    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Insufficient allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }
}

