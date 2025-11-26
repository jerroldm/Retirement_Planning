import React from 'react';
import { AssetCard } from './AssetCard';
import './AssetList.css';

export const AssetList = ({ assets, onEdit, onDelete, isLoading, onAddClick }) => {
  if (isLoading) {
    return (
      <div className="asset-list">
        <div className="asset-list-empty">
          <p>Loading assets...</p>
        </div>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="asset-list">
        <div className="asset-list-empty">
          <p>No assets yet</p>
          <button className="btn-add-asset" onClick={onAddClick}>
            + Add your first asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-list">
      <div className="asset-list-header">
        <h2>Your Assets</h2>
        <button className="btn-add-asset" onClick={onAddClick}>
          + Add Asset
        </button>
      </div>

      <div className="asset-list-content">
        {assets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
