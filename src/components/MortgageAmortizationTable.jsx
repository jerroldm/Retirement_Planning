import { useState } from 'react';
import './MortgageAmortizationTable.css';

export const MortgageAmortizationTable = ({ schedule }) => {
  const [filterYear, setFilterYear] = useState(null);

  if (!schedule || schedule.length === 0) {
    return (
      <div className="mortgage-amortization-container">
        <p>No mortgage data to display</p>
      </div>
    );
  }

  // Get unique years for filter
  const uniqueYears = [...new Set(schedule.map(row => row.year))].sort((a, b) => a - b);

  // Filter data (keep chronological order)
  let filteredData = filterYear ? schedule.filter(row => row.year === filterYear) : schedule;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMonthName = (monthNum) => {
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[monthNum];
  };

  return (
    <div className="mortgage-amortization-container">
      <div className="mortgage-header">
        <h2>Mortgage Amortization Schedule</h2>
        <p className="subtitle">Month-by-month principal and interest breakdown</p>
      </div>

      {uniqueYears.length > 1 && (
        <div className="filter-controls">
          <label htmlFor="year-filter">Filter by Year:</label>
          <select
            id="year-filter"
            value={filterYear || ''}
            onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className="record-count">
            Showing {filteredData.length} of {schedule.length} payments
          </span>
        </div>
      )}

      <div className="table-wrapper">
        <table className="mortgage-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Age</th>
              <th>Starting Balance</th>
              <th>Interest Payment</th>
              <th>Principal Payment</th>
              <th>Additional Principal</th>
              <th>Total Payment</th>
              <th>Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} className={`${row.endBalance === 0 ? 'final-payment' : ''} ${row.year % 2 === 0 ? 'year-even' : ''}`.trim()}>
                <td className="month-col">{row.month}</td>
                <td className="year-col">{row.year}</td>
                <td className="age-col">{row.age}</td>
                <td className="currency">{formatCurrency(row.startBalance)}</td>
                <td className="currency interest">{formatCurrency(row.interestPayment)}</td>
                <td className="currency principal">{formatCurrency(row.principalPayment)}</td>
                <td className="currency additional-principal">{formatCurrency(row.additionalPrincipal)}</td>
                <td className="currency total">{formatCurrency(row.totalPayment)}</td>
                <td className="currency">{formatCurrency(row.endBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mortgage-summary">
        <h3>Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total Payments:</span>
            <span className="value">{schedule.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Interest Paid:</span>
            <span className="value">{formatCurrency(schedule.reduce((sum, row) => sum + row.interestPayment, 0))}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Principal Paid:</span>
            <span className="value">{formatCurrency(schedule.reduce((sum, row) => sum + row.principalPayment, 0))}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Additional Principal:</span>
            <span className="value">{formatCurrency(schedule.reduce((sum, row) => sum + row.additionalPrincipal, 0))}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Amount Paid:</span>
            <span className="value">{formatCurrency(schedule.reduce((sum, row) => sum + row.totalPayment, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
