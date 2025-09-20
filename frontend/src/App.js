import React, { useState, useEffect, useCallback } from "react";
import { ethers, Contract, parseEther, formatEther } from "ethers";
import AIModelNFT from "./AIModelNFT.json";
import WalletConnect from "./components/WalletConnect";
import MintForm from "./components/MintForm";
import ModelGrid from "./components/ModelGrid";
import "./styles/App.css";

const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletConnect = ({ provider: walletProvider, signer: walletSigner, address }) => {
    setProvider(walletProvider);
    setSigner(walletSigner);
    setAccount(address);
    
    const c = new Contract(CONTRACT_ADDRESS, AIModelNFT.abi, signer);
    setContract(c);
  };

  // 🔹 Fetch metadata
  async function fetchMetadata(tokenURI) {
    try {
      if (!tokenURI) return null;
      const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch metadata`);
      return await res.json();
    } catch (err) {
      console.error("Metadata fetch error:", err.message);
      return null;
    }
  }

  // 🔹 Load NFTs
  const loadModels = useCallback(async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const totalBN = await contract.tokenCounter();
      const total = Number(totalBN);
      console.log("📦 Total NFTs:", total);

      if (total === 0) {
        setModels([]);
        setIsLoading(false);
        return;
      }

      const items = [];
      for (let i = 0; i < total; i++) {
        try {
          const model = await contract.models(i);
          const [owner, tokenURI] = await Promise.all([
            contract.ownerOf(i),
            contract.tokenURI(i),
          ]);
          const metadata = await fetchMetadata(tokenURI);

          items.push({
            tokenId: model.tokenId.toString(),
            price: formatEther(model.price),
            forSale: model.forSale,
            owner,
            tokenURI,
            metadata,
          });
        } catch (err) {
          console.warn(`⚠️ Skipping token ${i}:`, err.message);
        }
      }
      setModels(items);
      console.log("✅ Loaded items:", items);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  async function buyNFT(tokenId, price) {
    try {
      const tx = await contract.buyModel(tokenId, { value: parseEther(price) });
      await tx.wait();
      alert("✅ NFT Purchased");
      await loadModels();
    } catch (err) {
      console.error("Buy error:", err);
      alert("Purchase failed!");
    }
  }

  async function listNFT(tokenId) {
    const newPrice = prompt("Enter new price in ETH:");
    if (!newPrice) return;
    try {
      const tx = await contract.listForSale(tokenId, parseEther(newPrice));
      await tx.wait();
      alert("✅ NFT Listed for Sale");
      await loadModels();
    } catch (err) {
      console.error("List error:", err);
      alert("Listing failed!");
    }
  }

  useEffect(() => {
    if (contract) loadModels();
  }, [contract, loadModels]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Model NFT Marketplace</h1>
        <p>Decentralized marketplace for AI models as NFTs</p>
        <WalletConnect onConnect={handleWalletConnect} account={account} />
      </header>

      <main className="app-main">
        {account && contract && (
          <MintForm 
            contract={contract} 
            onMintSuccess={loadModels}
          />
        )}
        
        <ModelGrid
          models={models}
          account={account}
          onBuy={buyNFT}
          onList={listNFT}
          onRefresh={loadModels}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
