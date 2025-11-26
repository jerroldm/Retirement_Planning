import React from 'react';
import './IncomeList.css';

export const IncomeList = ({ sources, onEdit, onDelete }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const hasSources = sources && sources.length > 0;

  return (
    <div className="income-list">
      {!hasSources && (
        <div className="empty-state">
          <p>No income sources added yet. Click "Add Income Source" to get started.</p>
        </div>
      )}

      {hasSources && (
        <div className="income-container">
          {sources.map(source => (
            <div key={source.id} className="income-card">
              <div className="income-header">
                <div className="income-info">
                  <div>
                    <h5>{source.sourceName}</h5>
                  </div>
                </div>
                <div className="income-actions">
                  <button
                    className="btn-icon edit"
                    onClick={() => onEdit(source)}
                    title="Edit income source"
                  >
                    ✎
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => {
                      if (confirm(`Delete "${source.sourceName}"?`)) {
                        onDelete(source.id);
                      }
                    }}
                    title="Delete income source"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="income-details">
                <div className="detail-row">
                  <span className="label">Annual Salary:</span>
                  <span className="value">{formatCurrency(source.annualSalary)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Annual Increase:</span>
                  <span className="value">{source.annualSalaryIncrease || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
