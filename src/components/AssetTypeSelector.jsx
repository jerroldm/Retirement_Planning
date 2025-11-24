import React from 'react';
import { ASSET_TYPES } from '../config/assetConfig';
import './AssetTypeSelector.css';

export const AssetTypeSelector = ({ onSelect, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content asset-type-selector">
        <div className="modal-header">
          <h2>Add New Asset</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <p className="subtitle">Select the type of asset you want to add</p>

          <div className="asset-type-grid">
            {Object.entries(ASSET_TYPES).map(([key, config]) => (
              <button
                key={key}
                className="asset-type-card"
                onClick={() => onSelect(key)}
              >
                <div className="asset-type-icon">{config.icon}</div>
                <div className="asset-type-label">{config.label}</div>
                <div className="asset-type-description">{config.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
