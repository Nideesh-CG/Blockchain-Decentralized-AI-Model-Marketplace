// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    IERC721 public nftContract;
    
    struct Listing {
        address seller;
        uint256 price;
    }
    
    mapping(uint256 => Listing) public listings;
    
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sale(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event Cancelled(uint256 indexed tokenId);
    
    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }
    
    function listItem(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be > 0");
        require(nftContract.ownerOf(tokenId) == msg.sender, "You must own this NFT");
        require(
            nftContract.getApproved(tokenId) == address(this) || 
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        listings[tokenId] = Listing(msg.sender, price);
        emit Listed(tokenId, msg.sender, price);
    }
    
    function buyItem(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "Not listed");
        require(msg.value >= listing.price, "Not enough ETH");
        
        delete listings[tokenId];
        
        // Transfer payment to seller
        payable(listing.seller).transfer(msg.value);
        
        // Transfer NFT to buyer
        nftContract.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        emit Sale(tokenId, msg.sender, listing.price);
    }
    
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(msg.sender == listing.seller, "Not seller");
        
        delete listings[tokenId];
        emit Cancelled(tokenId);
    }
    
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}