// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNFT
 * @dev Simple NFT contract for testing fractionalization
 */
contract MockNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    // Token metadata
    mapping(uint256 => string) private _tokenURIs;
    
    constructor() ERC721("Mock NFT", "MNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new NFT
     * @param to Address to mint to
     * @param uri Metadata URI for the NFT
     */
    function mint(address to, string memory uri) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}

