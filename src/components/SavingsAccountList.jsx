import React from 'react';
import { ACCOUNT_TYPES } from '../config/savingsAccountConfig';
import './SavingsAccountList.css';

export const SavingsAccountList = ({ accounts, onEdit, onDelete, onAddAccount }) => {
  // Group accounts by owner
  const groupedByOwner = {};
  accounts.forEach(account => {
    const owner = account.owner || 'Unassigned';
    if (!groupedByOwner[owner]) {
      groupedByOwner[owner] = [];
    }
    groupedByOwner[owner].push(account);
  });

  // Sort owners: Joint first, then others alphabetically
  const sortedOwners = Object.keys(groupedByOwner).sort((a, b) => {
    if (a === 'Joint') return -1;
    if (b === 'Joint') return 1;
    return a.localeCompare(b);
  });

  const renderAccountsForOwner = (owner, ownerAccounts) => {
    if (ownerAccounts.length === 0) {
      return null;
    }

    return (
      <div key={owner} className="owner-section">
        <h4>{owner === 'Unassigned' ? 'Unassigned' : owner}</h4>
        <div className="accounts-grid">
          {ownerAccounts.map(account => {
            const accountConfig = ACCOUNT_TYPES[account.accountType];
            return (
              <div key={account.id} className="account-card">
                <div className="account-header">
                  <div className="account-info">
                    <span className="account-icon">{accountConfig?.icon}</span>
                    <div>
                      <h5>{account.accountName}</h5>
                      <p className="account-type">{accountConfig?.label}</p>
                    </div>
                  </div>
                  <div className="account-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => onEdit(account)}
                      title="Edit account"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => onDelete(account.id)}
                      title="Delete account"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="account-details">
                  <div className="detail-row">
                    <span className="label">Current Balance:</span>
                    <span className="value">${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {account.annualContribution > 0 && (
                    <div className="detail-row">
                      <span className="label">Annual Contribution:</span>
                      <span className="value">${account.annualContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {account.companyMatch > 0 && (
                    <div className="detail-row">
                      <span className="label">Company Match:</span>
                      <span className="value">${account.companyMatch.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {account.stopContributingMode && (
                    <div className="detail-row">
                      <span className="label">Stop Contributing:</span>
                      <span className="value">
                        {account.stopContributingMode === 'retirement' && 'At Retirement'}
                        {account.stopContributingMode === 'specific-age' && `Age ${account.stopContributingAge}`}
                        {account.stopContributingMode === 'specific-date' && account.stopContributingMonth && account.stopContributingYear && (
                          <>
                            {new Date(account.stopContributingYear, account.stopContributingMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAccounts = accounts.length > 0;

  return (
    <div className="savings-accounts-list">
      {!hasAccounts && (
        <div className="empty-state">
          <p>No savings accounts yet. Add your first account to get started.</p>
        </div>
      )}

      {hasAccounts && (
        <div className="accounts-container">
          {sortedOwners.map(owner => renderAccountsForOwner(owner, groupedByOwner[owner]))}
        </div>
      )}

      <button className="btn-add-account" onClick={onAddAccount}>
        + Add Savings Account
      </button>
    </div>
  );
};
