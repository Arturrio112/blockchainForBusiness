// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNFT
 * @dev Simple NFT contract with control hooks (no behavior change by default)
 */
contract MockNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    // Token metadata
    mapping(uint256 => string) private _tokenURIs;

    // --- Control / observability ---
    bool public mintingEnabled = true;
    string private _baseTokenURI;

    event MintingToggled(bool enabled);
    event BaseURIUpdated(string newBaseURI);
    event TokenMinted(address indexed to, uint256 indexed tokenId);

    constructor() ERC721("Mock NFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new NFT
     */
    function mint(address to, string memory uri) external returns (uint256) {
        require(mintingEnabled, "Minting disabled");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;

        emit TokenMinted(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Toggle minting (no effect unless used)
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingToggled(enabled);
    }

    /**
     * @dev Optional base URI (does not affect existing URIs unless set)
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Total minted tokens so far
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Explicit existence check (useful for external contracts)
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Token URI override
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        string memory tokenUri = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return tokenUri;
        }

        return string(abi.encodePacked(base, tokenUri));
    }

    /**
     * @dev Base URI override
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
