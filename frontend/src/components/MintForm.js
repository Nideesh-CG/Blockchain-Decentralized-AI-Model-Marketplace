import React, { useState } from 'react';
import { uploadToPinata } from '../pinata';

const MintForm = ({ contract, onMintSuccess }) => {
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [modelName, setModelName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!file || !price || !contract || !modelName) {
      alert("Please fill in all required fields!");
      return;
    }
    
    if (!agreed) {
      alert("You must agree to the terms before minting.");
      return;
    }

    setIsMinting(true);
    try {
      console.log("📤 Uploading to Pinata...");
      const tokenURI = await uploadToPinata(file, description, modelName);
      
      if (!tokenURI) {
        throw new Error("Failed to upload to IPFS");
      }

      console.log("✅ Metadata stored at:", tokenURI);
      console.log("⛓️ Sending mint transaction...");
      
      const tx = await contract.mintModel(tokenURI, ethers.parseEther(price));
      await tx.wait();

      alert("✅ NFT Minted Successfully!");
      
      // Reset form
      setFile(null);
      setPrice('');
      setDescription('');
      setModelName('');
      setAgreed(false);
      
      if (onMintSuccess) onMintSuccess();
      
    } catch (error) {
      console.error("❌ Minting error:", error);
      alert(`Minting failed: ${error.message}`);
    }
    setIsMinting(false);
  };

  return (
    <div className="mint-form">
      <h2>🚀 Mint AI Model NFT</h2>
      <form onSubmit={handleMint}>
        <div className="form-group">
          <label>Model Name *</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., GPT-Style Language Model"
            required
          />
        </div>

        <div className="form-group">
          <label>AI Model File *</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pkl,.h5,.onnx,.pt,.pth,.safetensors,.bin"
            required
          />
          <small>Supported formats: .pkl, .h5, .onnx, .pt, .pth, .safetensors, .bin</small>
        </div>

        <div className="form-group">
          <label>Price (ETH) *</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your AI model, its capabilities, training data, etc."
            rows="4"
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <label htmlFor="agreement">
            I agree not to upload malicious models and respect intellectual property rights *
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!agreed || isMinting}
          className="mint-btn"
        >
          {isMinting ? "Minting..." : "Mint NFT"}
        </button>
      </form>
    </div>
  );
};

export default MintForm;