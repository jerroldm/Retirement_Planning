import React from 'react';
import { ASSET_TYPES } from '../config/assetConfig';
import './AssetCard.css';

export const AssetCard = ({ asset, onEdit, onDelete }) => {
  const assetConfig = ASSET_TYPES[asset.assetType];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateNetValue = () => {
    const value = asset.currentValue || 0;
    const debt = asset.loanBalance || 0;
    return value - debt;
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${asset.assetName}"? This action cannot be undone.`)) {
      onDelete(asset.id);
    }
  };

  return (
    <div className="asset-card">
      <div className="asset-card-header">
        <div className="asset-header-left">
          <span className="asset-icon">{assetConfig.icon}</span>
          <div className="asset-header-info">
            <h3 className="asset-name">{asset.assetName}</h3>
            <p className="asset-type">{assetConfig.label}</p>
          </div>
        </div>
        <div className="asset-header-actions">
          <button
            className="btn-icon btn-edit"
            onClick={() => onEdit(asset)}
            title="Edit asset"
          >
            ✎
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={handleDelete}
            title="Delete asset"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="asset-card-body">
        <div className="asset-value-item">
          <span className="asset-value-label">Current Value:</span>
          <span className="asset-value-amount">{formatCurrency(asset.currentValue || 0)}</span>
        </div>

        {asset.loanBalance > 0 && (
          <>
            <div className="asset-value-item">
              <span className="asset-value-label">Loan Balance:</span>
              <span className="asset-value-amount loan">{formatCurrency(asset.loanBalance)}</span>
            </div>
            <div className="asset-value-item highlight">
              <span className="asset-value-label">Net Value:</span>
              <span className="asset-value-amount">{formatCurrency(calculateNetValue())}</span>
            </div>
          </>
        )}

        {asset.rentalIncome > 0 && (
          <div className="asset-value-item rental">
            <span className="asset-value-label">Annual Rental Income:</span>
            <span className="asset-value-amount income">{formatCurrency(asset.rentalIncome)}</span>
          </div>
        )}

        {asset.appreciationRate !== null && asset.appreciationRate !== undefined && (
          <div className="asset-value-item">
            <span className="asset-value-label">Appreciation Rate:</span>
            <span className={`asset-value-amount ${asset.appreciationRate >= 0 ? 'positive' : 'negative'}`}>
              {asset.appreciationRate.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {(asset.sellPlanEnabled === true || asset.sellPlanEnabled === 1) && (
        <div className="asset-card-footer">
          <span className="sell-plan-badge">
            📅 Sale planned for {asset.sellMonth}/{asset.sellYear}
          </span>
        </div>
      )}
    </div>
  );
};
