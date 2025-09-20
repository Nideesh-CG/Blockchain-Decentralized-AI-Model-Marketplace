const hre = require("hardhat");

async function main() {
  // 1️⃣ Deploy AIModelNFT
  const NFT = await hre.ethers.getContractFactory("AIModelNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ AIModelNFT deployed to:", nftAddress);

  // 2️⃣ Deploy Marketplace (passing NFT address to its constructor)
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(nftAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // 3️⃣ Print env snippet for you to copy into .env
  console.log("\n🔑 Add this to your frontend .env file:");
  console.log(`REACT_APP_NFT_CONTRACT=${nftAddress}`);
  console.log(`REACT_APP_MARKETPLACE_CONTRACT=${marketplaceAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
