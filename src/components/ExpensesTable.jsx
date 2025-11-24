import React, { useState } from 'react';
import './DataTable.css';

export const ExpensesTable = ({ data }) => {
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
        <h2>Expenses Breakdown</h2>
        <p className="table-description">Annual expenses broken down by category</p>
      </div>

      <div className="table-wrapper">
        <table className="year-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('age')} className="sortable">
                Age <SortIcon column="age" />
              </th>
              <th onClick={() => handleSort('livingExpenses')} className="sortable">
                Living Expenses <SortIcon column="livingExpenses" />
              </th>
              <th onClick={() => handleSort('mortgagePayment')} className="sortable">
                Mortgage Payment <SortIcon column="mortgagePayment" />
              </th>
              <th onClick={() => handleSort('expenses')} className="sortable">
                Total Expenses <SortIcon column="expenses" />
              </th>
              <th onClick={() => handleSort('totalContributions')} className="sortable">
                Contributions <SortIcon column="totalContributions" />
              </th>
              <th onClick={() => handleSort('taxes')} className="sortable">
                Taxes <SortIcon column="taxes" />
              </th>
              <th onClick={() => handleSort('netIncome')} className="sortable">
                Net Income <SortIcon column="netIncome" />
              </th>
              <th onClick={() => handleSort('cashFlow')} className="sortable">
                Cash Flow <SortIcon column="cashFlow" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} className={`data-row ${row.isRetired ? 'retired' : ''}`}>
                <td className="age-cell">
                  {row.age}
                  {row.isRetired && <span className="badge">Retired</span>}
                </td>
                <td>{formatCurrency(row.livingExpenses)}</td>
                <td>{formatCurrency(row.mortgagePayment)}</td>
                <td>{formatCurrency(row.expenses)}</td>
                <td>{formatCurrency(row.totalContributions)}</td>
                <td>{formatCurrency(row.taxes)}</td>
                <td>{formatCurrency(row.netIncome)}</td>
                <td className={row.cashFlow >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(row.cashFlow)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
