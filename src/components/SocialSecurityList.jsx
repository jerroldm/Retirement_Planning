import React from 'react';
import './SocialSecurityList.css';

export const SocialSecurityList = ({ records, persons, onEdit, onDelete, onAddRecord }) => {
  const hasRecords = records && records.length > 0;

  const getPersonName = (personId) => {
    const person = persons?.find(p => p.id === personId);
    return person ? `${person.firstName} (${person.personType === 'self' ? 'Self' : 'Spouse'})` : 'Unknown';
  };

  if (!hasRecords) {
    return (
      <div className="social-security-list">
        <div className="social-security-list-empty">
          <p>No social security records yet.</p>
          <button className="btn-add-social-security" onClick={onAddRecord}>
            + Add your first social security record
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="social-security-list">
      <div className="social-security-list-header">
        <h2>Social Security Benefits</h2>
        <button className="btn-add-social-security" onClick={onAddRecord}>
          + Add Social Security
        </button>
      </div>
      <div className="social-security-container">
        {records.map(record => (
          <div key={record.id} className="social-security-card">
            <div className="social-security-header">
              <div className="social-security-info">
                <h5>{getPersonName(record.personId)}</h5>
              </div>
              <div className="social-security-actions">
                <button
                  className="btn-icon edit"
                  onClick={() => onEdit(record)}
                  title="Edit social security"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => onDelete(record.id)}
                  title="Delete social security"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="social-security-details">
              <div className="detail-row">
                <span className="label">Annual Benefit at FRA (67):</span>
                <span className="value">${record.estimatedAnnualBenefit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="detail-row">
                <span className="label">Planned Claiming Age:</span>
                <span className="value">{record.plannedClaimingAge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
