import React, { useState, useEffect, useCallback } from "react";
import { ethers, Contract, parseEther, formatEther } from "ethers";
import AIModelNFT from "./AIModelNFT.json";
import { uploadToPinata } from "./pinata";

const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const HARDHAT_CHAIN_ID = "0x7A69"; // Hardhat local chain id in hex

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [models, setModels] = useState([]);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [agreed, setAgreed] = useState(false);

  // 🔹 Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not detected!");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: HARDHAT_CHAIN_ID,
                chainName: "Hardhat Localhost 8545",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["http://127.0.0.1:8545/"],
              },
            ],
          });
        } catch (addErr) {
          console.error("Failed to add network:", addErr);
          return;
        }
      } else {
        console.error("Network switch error:", err);
        return;
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum, {
      name: "hardhat",
      chainId: 31337,
    });

    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);

    const c = new Contract(CONTRACT_ADDRESS, AIModelNFT.abi, signer);
    setContract(c);
  }

  // 🔹 Mint NFT
  async function mintNFT() {
    if (!file || !price || !contract) {
      alert("Connect wallet, select file & set price!");
      return;
    }
    if (!agreed) {
      alert("You must agree not to misuse the model before minting.");
      return;
    }

    try {
      console.log("📤 Uploading to Pinata...");
      const tokenURI = await uploadToPinata(file, desc);
      if (!tokenURI) throw new Error("Pinata upload failed");

      console.log("✅ Metadata stored at:", tokenURI);
      console.log("⛓️ Sending mint transaction...");
      const tx = await contract.mintModel(tokenURI, parseEther(price));
      await tx.wait(); // ✅ Wait for block confirmation

      alert("✅ NFT Minted Successfully");
      await loadModels(); // ✅ Immediately reload NFTs
    } catch (err) {
      console.error("❌ Minting error:", err);
      alert("Mint failed! Check console for details.");
    }
  }

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
    try {
      const totalBN = await contract.tokenCounter();
      const total = Number(totalBN);
      console.log("📦 Total NFTs:", total);

      if (total === 0) return setModels([]);

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
    <div style={{ padding: "20px" }}>
      <h1>🚀 AI Model NFT Marketplace</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>✅ Connected as {account}</p>
      )}

      <h2>Mint AI Model NFT</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="text"
        placeholder="Price in ETH"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Model description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div style={{ marginTop: "8px" }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label> I agree not to misuse this model</label>
      </div>
      <button onClick={mintNFT} disabled={!agreed}>
        Mint NFT
      </button>

      <h2>Available AI Model NFTs</h2>
      <button onClick={loadModels}>🔄 Refresh</button>

      <div>
        {models.length === 0 ? (
          <p>No NFTs minted yet.</p>
        ) : (
          models.map((m) => (
            <div
              key={m.tokenId}
              style={{
                border: "1px solid black",
                margin: "10px",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <p>
                <b>Token ID:</b> {m.tokenId}
              </p>
              <p>
                <b>Owner:</b> {m.owner}
              </p>
              <p>
                <b>Price:</b> {Number(m.price).toFixed(3)} ETH
              </p>
              <p>
                <b>Status:</b> {m.forSale ? "For Sale" : "Not for Sale"}
              </p>
              <p>
                <b>Metadata:</b>{" "}
                <a
                  href={m.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  target="_blank"
                  rel="noreferrer"
                >
                  View JSON
                </a>
              </p>
              {m.metadata?.image && (
                <p>
                  <b>AI Model File:</b>{" "}
                  <a
                    href={m.metadata.image.replace(
                      "ipfs://",
                      "https://ipfs.io/ipfs/"
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                </p>
              )}

              {m.forSale && account !== m.owner && (
                <button onClick={() => buyNFT(m.tokenId, m.price)}>Buy</button>
              )}
              {account === m.owner && !m.forSale && (
                <button onClick={() => listNFT(m.tokenId)}>List for Sale</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
