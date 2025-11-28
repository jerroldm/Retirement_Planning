import React from 'react';
import '../styles/DataTable.css';

/**
 * SavingsAccountsTable Component
 *
 * Displays per-account breakdown of contributions, withdrawals, growth, and year-end balances
 * for all savings accounts in the retirement projection.
 *
 * Props:
 *   accountsBreakdown: Array of account objects, each with:
 *     - id: Account identifier
 *     - accountName: Display name of the account
 *     - accountType: Type of account (traditional-ira, roth-ira, investment-account, etc.)
 *     - yearlyHistory: Array of yearly records with age, contributions, withdrawals, growth, endingBalance
 *     - finalBalance: Current balance of the account
 */
const SavingsAccountsTable = ({ accountsBreakdown = [] }) => {
  if (!accountsBreakdown || accountsBreakdown.length === 0) {
    return (
      <div className="table-container">
        <p className="no-data">No savings accounts configured. Add accounts on the Savings tab to see breakdown.</p>
      </div>
    );
  }

  // Account type display labels
  const accountTypeLabels = {
    'traditional-ira': 'Traditional IRA',
    'roth-ira': 'Roth IRA',
    'investment-account': 'Investment Account',
    'savings-account': 'Savings Account',
    'other-account': 'Other Account',
    '401k': '401(k)',
  };

  const getAccountTypeLabel = (accountType) => {
    return accountTypeLabels[accountType] || accountType;
  };

  return (
    <div className="table-container">
      <h2>Savings Accounts Breakdown</h2>
      <p className="table-subtitle">Year-by-year tracking of individual account inflows, outflows, and growth</p>

      {accountsBreakdown.map((account) => (
        <div key={account.id} className="account-section">
          <div className="account-header">
            <h3>{account.accountName}</h3>
            <span className="account-type">{getAccountTypeLabel(account.accountType)}</span>
          </div>

          {account.yearlyHistory && account.yearlyHistory.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Age</th>
                  <th>Year</th>
                  <th>Beginning Balance</th>
                  <th>Contributions</th>
                  <th>Withdrawals</th>
                  <th>Growth</th>
                  <th>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {account.yearlyHistory.map((record, index) => (
                  <tr key={index} className={record.age >= 65 ? 'retired-row' : ''}>
                    <td className="age-cell">{record.age}</td>
                    <td className="year-cell">{record.year}</td>
                    <td className="currency">${record.beginningBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="currency positive">${record.contributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="currency negative">${record.withdrawals.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="currency growth">${record.growth.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="currency total">${record.endingBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-account">No projection data available for this account</p>
          )}

          <div className="account-summary">
            <span className="summary-label">Final Balance:</span>
            <span className="summary-value">${account.finalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      ))}

      <style jsx>{`
        .account-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .account-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #1f2937;
        }

        .account-type {
          display: inline-block;
          background-color: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .account-summary {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-weight: 600;
        }

        .summary-label {
          color: #6b7280;
        }

        .summary-value {
          color: #059669;
        }

        .no-data-account {
          color: #9ca3af;
          font-style: italic;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default SavingsAccountsTable;
