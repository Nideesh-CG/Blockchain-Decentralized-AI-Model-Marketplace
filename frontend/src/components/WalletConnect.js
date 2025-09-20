import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const HARDHAT_CHAIN_ID = "0x7A69";

const WalletConnect = ({ onConnect, account }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    try {
      // Switch to Hardhat network
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
          setIsConnecting(false);
          return;
        }
      } else {
        console.error("Network switch error:", err);
        setIsConnecting(false);
        return;
      }
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      onConnect({ provider, signer, address });
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet");
    }
    setIsConnecting(false);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {!account ? (
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="connect-btn"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            ✅ Connected: {formatAddress(account)}
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;