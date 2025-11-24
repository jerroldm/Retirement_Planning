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

  // Group assets by type for better organization
  const assetsByType = assets.reduce((grouped, asset) => {
    const type = asset.assetType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(asset);
    return grouped;
  }, {});

  return (
    <div className="asset-list">
      <div className="asset-list-header">
        <h2>Your Assets</h2>
        <button className="btn-add-asset" onClick={onAddClick}>
          + Add Asset
        </button>
      </div>

      <div className="asset-list-content">
        {Object.entries(assetsByType).map(([type, typeAssets]) => (
          <div key={type} className="asset-type-group">
            <div className="asset-type-group-header">
              <h3>{type.replace('-', ' ').toUpperCase()}</h3>
              <span className="asset-count">{typeAssets.length} {typeAssets.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="asset-cards-grid">
              {typeAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
