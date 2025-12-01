import React from 'react';
import { ACCOUNT_TYPES } from '../config/savingsAccountConfig';
import './SavingsAccountList.css';

export const SavingsAccountList = ({ accounts, onEdit, onDelete, onAddAccount }) => {
  console.log('[SavingsAccountList] Received accounts:', accounts);
  if (accounts && accounts.length > 0) {
    console.log('[SavingsAccountList] First account:', accounts[0]);
    console.log('[SavingsAccountList] First account ID:', accounts[0].id);
  }
  const hasAccounts = accounts && accounts.length > 0;

  if (!hasAccounts) {
    return (
      <div className="savings-accounts-list">
        <div className="accounts-list-empty">
          <p>No savings accounts yet.</p>
          <button className="btn-add-account" onClick={onAddAccount}>
            + Add your first savings account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="savings-accounts-list">
      <div className="accounts-list-header">
        <h2>Your Savings Accounts</h2>
        <button className="btn-add-account" onClick={onAddAccount}>
          + Add Savings Account
        </button>
      </div>
      <div className="accounts-container">
        {accounts.map(account => {
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
