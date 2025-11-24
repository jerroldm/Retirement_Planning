import React from 'react';
import { ACCOUNT_TYPES } from '../config/savingsAccountConfig';
import './SavingsAccountTypeSelector.css';

export const SavingsAccountTypeSelector = ({ onTypeSelect, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Select Account Type</h2>
        <div className="account-type-grid">
          {Object.entries(ACCOUNT_TYPES).map(([key, type]) => (
            <button
              key={key}
              className="account-type-card"
              onClick={() => onTypeSelect(key)}
            >
              <div className="account-type-icon">{type.icon}</div>
              <h4>{type.label}</h4>
              <p>{type.description}</p>
            </button>
          ))}
        </div>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};
