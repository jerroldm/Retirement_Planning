import React from 'react';
import './DataTable.css';
import '../styles/SavingsAccountsTable.css';

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
            <div className="table-wrapper">
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
                    <tr key={index} className={record.isRetired ? 'retired-row' : ''}>
                      <td className="age-cell">
                        {record.age}
                        {record.isRetired && <span className="badge">Retired</span>}
                      </td>
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
            </div>
          ) : (
            <p className="no-data-account">No projection data available for this account</p>
          )}

          <div className="account-summary">
            <span className="summary-label">Final Balance:</span>
            <span className="summary-value">${account.finalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavingsAccountsTable;
