import React from 'react';
import { ethers } from 'ethers';

const ModelCard = ({ model, account, onBuy, onList }) => {
  const isOwner = account && model.owner.toLowerCase() === account.toLowerCase();
  const canBuy = model.forSale && !isOwner;
  
  const handleBuy = () => {
    if (onBuy) onBuy(model.tokenId, model.price);
  };

  const handleList = () => {
    if (onList) onList(model.tokenId);
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(4);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getImageUrl = (tokenURI) => {
    if (!tokenURI) return null;
    return tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
  };

  const getDownloadUrl = (metadata) => {
    if (!metadata?.image) return null;
    return metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  };

  return (
    <div className="model-card">
      <div className="card-header">
        <h3>
          {model.metadata?.name || `AI Model #${model.tokenId}`}
        </h3>
        <span className={`status ${model.forSale ? 'for-sale' : 'not-for-sale'}`}>
          {model.forSale ? '🟢 For Sale' : '🔴 Not for Sale'}
        </span>
      </div>

      <div className="card-content">
        <div className="model-info">
          <p><strong>Token ID:</strong> {model.tokenId}</p>
          <p><strong>Owner:</strong> {formatAddress(model.owner)}</p>
          <p><strong>Price:</strong> {formatPrice(model.price)} ETH</p>
          
          {model.metadata?.description && (
            <p><strong>Description:</strong> {model.metadata.description}</p>
          )}
          
          {model.metadata?.properties && (
            <div className="properties">
              <p><strong>File Type:</strong> {model.metadata.properties.fileType}</p>
              <p><strong>File Size:</strong> {(model.metadata.properties.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div className="card-links">
          <a
            href={getImageUrl(model.tokenURI)}
            target="_blank"
            rel="noreferrer"
            className="link-btn metadata-link"
          >
            📄 View Metadata
          </a>
          
          {model.metadata?.image && (
            <a
              href={getDownloadUrl(model.metadata)}
              target="_blank"
              rel="noreferrer"
              className="link-btn download-link"
            >
              📥 Download Model
            </a>
          )}
        </div>

        <div className="card-actions">
          {canBuy && (
            <button onClick={handleBuy} className="buy-btn">
              Buy for {formatPrice(model.price)} ETH
            </button>
          )}
          
          {isOwner && !model.forSale && (
            <button onClick={handleList} className="list-btn">
              List for Sale
            </button>
          )}
          
          {isOwner && (
            <span className="owner-badge">👑 You own this</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;