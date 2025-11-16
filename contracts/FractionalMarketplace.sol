// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FractionalMarketplace
 * @dev Marketplace for buying and selling fractional NFT tokens
 */
contract FractionalMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        address fractionalToken;
        uint256 amount;
        uint256 pricePerToken; // Price in wei per token
        bool isActive;
    }
    
    // Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;
    
    // Trading fee percentage (0.5% = 50 basis points)
    uint256 public tradingFeePercentage = 50; // 0.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Platform owner
    address public platformOwner;
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed fractionalToken,
        uint256 amount,
        uint256 pricePerToken
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event TokensPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    /**
     * @dev Create a listing to sell fractional tokens
     * @param _fractionalToken Address of the fractional token
     * @param _amount Amount of tokens to sell
     * @param _pricePerToken Price per token in wei
     */
    function createListing(
        address _fractionalToken,
        uint256 _amount,
        uint256 _pricePerToken
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_pricePerToken > 0, "Price must be greater than 0");
        
        IERC20 token = IERC20(_fractionalToken);
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(
            token.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        
        // Transfer tokens to marketplace
        token.transferFrom(msg.sender, address(this), _amount);
        
        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            fractionalToken: _fractionalToken,
            amount: _amount,
            pricePerToken: _pricePerToken,
            isActive: true
        });
        
        emit ListingCreated(
            listingId,
            msg.sender,
            _fractionalToken,
            _amount,
            _pricePerToken
        );
        
        return listingId;
    }
    
    /**
     * @dev Cancel a listing and return tokens to seller
     * @param _listingId ID of the listing to cancel
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not listing owner");
        
        listing.isActive = false;
        
        // Return tokens to seller
        IERC20 token = IERC20(listing.fractionalToken);
        token.transfer(msg.sender, listing.amount);
        
        emit ListingCancelled(_listingId);
    }
    
    /**
     * @dev Purchase tokens from a listing
     * @param _listingId ID of the listing
     * @param _amount Amount of tokens to purchase
     */
    function purchaseTokens(uint256 _listingId, uint256 _amount) 
        external 
        payable 
        nonReentrant 
    {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        
        uint256 totalPrice = _amount * listing.pricePerToken;
        uint256 fee = (totalPrice * tradingFeePercentage) / FEE_DENOMINATOR;
        uint256 sellerAmount = totalPrice - fee;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Update listing
        listing.amount -= _amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }
        
        // Transfer tokens to buyer
        IERC20 token = IERC20(listing.fractionalToken);
        token.transfer(msg.sender, _amount);
        
        // Transfer payment to seller (minus fee)
        payable(listing.seller).transfer(sellerAmount);
        
        // Transfer fee to platform
        if (fee > 0) {
            payable(platformOwner).transfer(fee);
        }
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit TokensPurchased(_listingId, msg.sender, _amount, totalPrice);
    }
    
    /**
     * @dev Get active listings (simplified - returns first N listings)
     */
    function getActiveListings(uint256 _limit) 
        external 
        view 
        returns (
            uint256[] memory listingIds,
            address[] memory sellers,
            address[] memory tokens,
            uint256[] memory amounts,
            uint256[] memory prices
        ) 
    {
        uint256 count = 0;
        uint256 limit = _limit > nextListingId ? nextListingId : _limit;
        
        // Count active listings
        for (uint256 i = 0; i < nextListingId && count < limit; i++) {
            if (listings[i].isActive) {
                count++;
            }
        }
        
        listingIds = new uint256[](count);
        sellers = new address[](count);
        tokens = new address[](count);
        amounts = new uint256[](count);
        prices = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < nextListingId && index < count; i++) {
            if (listings[i].isActive) {
                listingIds[index] = i;
                sellers[index] = listings[i].seller;
                tokens[index] = listings[i].fractionalToken;
                amounts[index] = listings[i].amount;
                prices[index] = listings[i].pricePerToken;
                index++;
            }
        }
        
        return (listingIds, sellers, tokens, amounts, prices);
    }
    
    /**
     * @dev Update trading fee (only owner)
     */
    function updateTradingFee(uint256 _newFeePercentage) external {
        require(msg.sender == platformOwner, "Only platform owner");
        require(_newFeePercentage <= 500, "Fee too high"); // Max 5%
        tradingFeePercentage = _newFeePercentage;
    }
}

