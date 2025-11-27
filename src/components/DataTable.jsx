import React, { useState } from 'react';
import './DataTable.css';

export const DataTable = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'age', direction: 'asc' });

  if (!data || data.length === 0) {
    return <div className="data-table empty">No data available. Enter your financial information to see projections.</div>;
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="sort-icon">⇅</span>;
    return sortConfig.direction === 'asc' ? <span className="sort-icon">▲</span> : <span className="sort-icon">▼</span>;
  };

  return (
    <div className="data-table">
      <div className="table-header">
        <h2>Year-by-Year Breakdown</h2>
        <p className="table-description">Click any row to see detailed information</p>
      </div>

      <div className="table-wrapper">
        <table className="year-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('age')} className="sortable">
                Age <SortIcon column="age" />
              </th>
              <th onClick={() => handleSort('salary')} className="sortable">
                Gross Salary <SortIcon column="salary" />
              </th>
              <th onClick={() => handleSort('agi')} className="sortable">
                AGI <SortIcon column="agi" />
              </th>
              <th onClick={() => handleSort('federalOrdinaryTax')} className="sortable">
                Federal Ord. Tax <SortIcon column="federalOrdinaryTax" />
              </th>
              <th onClick={() => handleSort('federalCapitalGainsTax')} className="sortable">
                Federal Cap. Gains Tax <SortIcon column="federalCapitalGainsTax" />
              </th>
              <th onClick={() => handleSort('stateTax')} className="sortable">
                State Tax <SortIcon column="stateTax" />
              </th>
              <th onClick={() => handleSort('taxes')} className="sortable">
                Total Tax <SortIcon column="taxes" />
              </th>
              <th onClick={() => handleSort('totalWithdrawals')} className="sortable">
                Withdrawals <SortIcon column="totalWithdrawals" />
              </th>
              <th onClick={() => handleSort('expenses')} className="sortable">
                Expenses <SortIcon column="expenses" />
              </th>
              <th onClick={() => handleSort('cashFlow')} className="sortable">
                Cash Flow <SortIcon column="cashFlow" />
              </th>
              <th onClick={() => handleSort('totalRetirementSavings')} className="sortable">
                Retirement Savings <SortIcon column="totalRetirementSavings" />
              </th>
              <th onClick={() => handleSort('homeEquity')} className="sortable">
                Home Equity <SortIcon column="homeEquity" />
              </th>
              <th onClick={() => handleSort('totalNetWorth')} className="sortable">
                Total Net Worth <SortIcon column="totalNetWorth" />
              </th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr className={`data-row ${row.isRetired ? 'retired' : ''} ${expandedRow === idx ? 'expanded' : ''}`}>
                  <td className="age-cell">
                    {row.age}
                    {row.isRetired && <span className="badge">Retired</span>}
                  </td>
                  <td>{formatCurrency(row.salary)}</td>
                  <td>{formatCurrency(row.agi || 0)}</td>
                  <td>{formatCurrency(row.federalOrdinaryTax || 0)}</td>
                  <td>{formatCurrency(row.federalCapitalGainsTax || 0)}</td>
                  <td>{formatCurrency(row.stateTax || 0)}</td>
                  <td>{formatCurrency(row.taxes)}</td>
                  <td>{formatCurrency(row.totalWithdrawals || 0)}</td>
                  <td>{formatCurrency(row.expenses)}</td>
                  <td className={row.cashFlow >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(row.cashFlow)}
                  </td>
                  <td>{formatCurrency(row.totalRetirementSavings)}</td>
                  <td>{formatCurrency(row.homeEquity)}</td>
                  <td className="net-worth-cell">{formatCurrency(row.totalNetWorth)}</td>
                  <td>
                    <button
                      className="btn-expand"
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    >
                      {expandedRow === idx ? '−' : '+'}
                    </button>
                  </td>
                </tr>
                {expandedRow === idx && (
                  <tr className="detail-row">
                    <td colSpan="14">
                      <div className="details-grid">
                        <div className="detail-section">
                          <h4>Tax Breakdown</h4>
                          <div className="detail-item">
                            <label>Federal Ordinary Income Tax</label>
                            <value>{formatCurrency(row.federalOrdinaryTax || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Federal Capital Gains Tax</label>
                            <value>{formatCurrency(row.federalCapitalGainsTax || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>State Tax ({row.currentState})</label>
                            <value>{formatCurrency(row.stateTax || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Total Taxes</label>
                            <value>{formatCurrency(row.taxes)}</value>
                          </div>
                        </div>
                        <div className="detail-section">
                          <h4>Withdrawal Breakdown</h4>
                          <div className="detail-item">
                            <label>Traditional IRA Withdrawal</label>
                            <value>{formatCurrency(row.traditionalIRAWithdrawal || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Roth IRA Withdrawal</label>
                            <value>{formatCurrency(row.rothIRAWithdrawal || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Investment Account Withdrawal</label>
                            <value>{formatCurrency(row.investmentAccountsWithdrawal || 0)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Total Withdrawals</label>
                            <value>{formatCurrency(row.totalWithdrawals || 0)}</value>
                          </div>
                        </div>
                        <div className="detail-section">
                          <h4>Account Balances</h4>
                          <div className="detail-item">
                            <label>Net Income</label>
                            <value>{formatCurrency(row.netIncome)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Traditional IRA/401(k) Balance</label>
                            <value>{formatCurrency(row.traditionalIRA)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Roth IRA/401(k) Balance</label>
                            <value>{formatCurrency(row.rothIRA)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Investment Accounts Balance</label>
                            <value>{formatCurrency(row.investmentAccounts)}</value>
                          </div>
                        </div>
                        <div className="detail-section">
                          <h4>Other Assets</h4>
                          <div className="detail-item">
                            <label>Home Value</label>
                            <value>{formatCurrency(row.homeValue)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Mortgage Balance</label>
                            <value>{formatCurrency(row.mortgageBalance)}</value>
                          </div>
                          <div className="detail-item">
                            <label>Other Assets</label>
                            <value>{formatCurrency(row.otherAssets)}</value>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
