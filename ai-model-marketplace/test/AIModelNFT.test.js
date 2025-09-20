const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIModelNFT", function () {
  let aiModelNFT;
  let owner;
  let buyer;
  let otherAccount;

  beforeEach(async function () {
    [owner, buyer, otherAccount] = await ethers.getSigners();
    
    const AIModelNFT = await ethers.getContractFactory("AIModelNFT");
    aiModelNFT = await AIModelNFT.deploy();
    await aiModelNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await aiModelNFT.name()).to.equal("AIModelNFT");
      expect(await aiModelNFT.symbol()).to.equal("AIM");
    });

    it("Should start with token counter at 0", async function () {
      expect(await aiModelNFT.tokenCounter()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT with correct metadata", async function () {
      const tokenURI = "ipfs://QmTest123";
      const price = ethers.parseEther("1.0");

      const tx = await aiModelNFT.mintModel(tokenURI, price);
      await tx.wait();

      expect(await aiModelNFT.tokenCounter()).to.equal(1);
      expect(await aiModelNFT.ownerOf(0)).to.equal(owner.address);
      expect(await aiModelNFT.tokenURI(0)).to.equal(tokenURI);

      const model = await aiModelNFT.models(0);
      expect(model.tokenId).to.equal(0);
      expect(model.price).to.equal(price);
      expect(model.forSale).to.equal(false);
    });

    it("Should increment token counter correctly", async function () {
      await aiModelNFT.mintModel("ipfs://test1", ethers.parseEther("1.0"));
      await aiModelNFT.mintModel("ipfs://test2", ethers.parseEther("2.0"));

      expect(await aiModelNFT.tokenCounter()).to.equal(2);
      expect(await aiModelNFT.ownerOf(0)).to.equal(owner.address);
      expect(await aiModelNFT.ownerOf(1)).to.equal(owner.address);
    });
  });

  describe("Listing for Sale", function () {
    beforeEach(async function () {
      await aiModelNFT.mintModel("ipfs://test", ethers.parseEther("1.0"));
    });

    it("Should allow owner to list NFT for sale", async function () {
      const newPrice = ethers.parseEther("2.0");
      
      await aiModelNFT.listForSale(0, newPrice);
      
      const model = await aiModelNFT.models(0);
      expect(model.forSale).to.equal(true);
      expect(model.price).to.equal(newPrice);
    });

    it("Should not allow non-owner to list NFT", async function () {
      const newPrice = ethers.parseEther("2.0");
      
      await expect(
        aiModelNFT.connect(buyer).listForSale(0, newPrice)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Buying NFTs", function () {
    beforeEach(async function () {
      await aiModelNFT.mintModel("ipfs://test", ethers.parseEther("1.0"));
      await aiModelNFT.listForSale(0, ethers.parseEther("2.0"));
    });

    it("Should allow buying listed NFT with correct payment", async function () {
      const price = ethers.parseEther("2.0");
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      await aiModelNFT.connect(buyer).buyModel(0, { value: price });
      
      expect(await aiModelNFT.ownerOf(0)).to.equal(buyer.address);
      
      const model = await aiModelNFT.models(0);
      expect(model.forSale).to.equal(false);
      
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it("Should not allow buying with insufficient payment", async function () {
      const insufficientPrice = ethers.parseEther("1.0");
      
      await expect(
        aiModelNFT.connect(buyer).buyModel(0, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("Should not allow buying NFT not for sale", async function () {
      await aiModelNFT.mintModel("ipfs://test2", ethers.parseEther("1.0"));
      // Token 1 is not listed for sale
      
      await expect(
        aiModelNFT.connect(buyer).buyModel(1, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Not for sale");
    });
  });
});