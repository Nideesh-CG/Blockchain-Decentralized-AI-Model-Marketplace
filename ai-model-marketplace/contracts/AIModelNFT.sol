// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AIModelNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    struct Model {
        uint256 tokenId;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => Model) public models;

    constructor() ERC721("AIModelNFT", "AIM") {
        tokenCounter = 0; // Start from 0
    }

    /// 🔹 Mint new NFT with price
    function mintModel(string memory tokenURI, uint256 price) public returns (uint256) {
        uint256 newId = tokenCounter; // First token will be ID 0
        tokenCounter++; // Increment AFTER assigning

        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);

        models[newId] = Model(newId, price, false);

        return newId;
    }

    /// 🔹 List NFT for sale
    function listForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        models[tokenId].price = price;
        models[tokenId].forSale = true;
    }

    /// 🔹 Buy NFT
    function buyModel(uint256 tokenId) public payable {
        Model memory m = models[tokenId];
        require(m.forSale, "Not for sale");
        require(msg.value >= m.price, "Insufficient ETH");

        address seller = ownerOf(tokenId);

        // Transfer funds to seller
        payable(seller).transfer(msg.value);

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Update state
        models[tokenId].forSale = false;
    }
}
