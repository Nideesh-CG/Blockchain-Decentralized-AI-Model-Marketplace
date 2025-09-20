import React from 'react';
import ModelCard from './ModelCard';

const ModelGrid = ({ models, account, onBuy, onList, onRefresh, isLoading }) => {
  return (
    <div className="model-grid-container">
      <div className="grid-header">
        <h2>🤖 AI Model Marketplace</h2>
        <button onClick={onRefresh} disabled={isLoading} className="refresh-btn">
          {isLoading ? "🔄 Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {models.length === 0 ? (
        <div className="empty-state">
          <h3>No AI Models Available</h3>
          <p>Be the first to mint an AI model NFT!</p>
        </div>
      ) : (
        <div className="model-grid">
          {models.map((model) => (
            <ModelCard
              key={model.tokenId}
              model={model}
              account={account}
              onBuy={onBuy}
              onList={onList}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelGrid;