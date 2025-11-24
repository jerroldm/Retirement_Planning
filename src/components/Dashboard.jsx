import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

export const Dashboard = ({ data }) => {
  const [activeTab, setActiveTab] = useState('portfolio');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      totalRetirementSavings: item.totalRetirementSavings,
      totalNetWorth: item.totalNetWorth,
      homeEquity: item.homeEquity,
      salary: item.salary,
      taxes: item.taxes,
      expenses: item.expenses,
      cashFlow: item.cashFlow,
      age: item.age
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="dashboard empty">Enter your financial information to see projections</div>;
  }

  const currentYear = chartData[0];
  const retirementYear = chartData.find(d => d.isRetired);
  const lastYear = chartData[chartData.length - 1];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Retirement Projections Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Current Net Worth</div>
          <div className="metric-value">${currentYear.totalNetWorth.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Retirement Net Worth</div>
          <div className="metric-value">
            {retirementYear ? `$${retirementYear.totalNetWorth.toLocaleString()}` : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Final Net Worth</div>
          <div className="metric-value">${lastYear.totalNetWorth.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Retirement Savings Growth</div>
          <div className="metric-value">
            {retirementYear ? `$${retirementYear.totalRetirementSavings.toLocaleString()}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio Growth
        </button>
        <button
          className={`tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income & Expenses
        </button>
        <button
          className={`tab ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Asset Breakdown
        </button>
        <button
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Account Types
        </button>
      </div>

      <div className="charts-container">
        {/* Portfolio Growth */}
        {activeTab === 'portfolio' && (
          <div className="chart-section">
            <h3>Net Worth & Retirement Savings Projection</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ left: 60, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalNetWorth"
                  stroke="#007bff"
                  name="Total Net Worth"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="totalRetirementSavings"
                  stroke="#28a745"
                  name="Retirement Savings"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income & Expenses */}
        {activeTab === 'income' && (
          <div className="chart-section">
            <h3>Annual Income, Expenses & Cash Flow</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ left: 60, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Bar dataKey="salary" fill="#007bff" name="Gross Salary" />
                <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                <Bar dataKey="cashFlow" fill="#28a745" name="Cash Flow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Asset Breakdown at Retirement */}
        {activeTab === 'breakdown' && retirementYear && (
          <div className="chart-section">
            <h3>Asset Breakdown at Retirement (Age {retirementYear.age})</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Retirement Savings', value: retirementYear.totalRetirementSavings },
                    { name: 'Home Equity', value: retirementYear.homeEquity },
                    { name: 'Other Assets', value: retirementYear.otherAssets },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#007bff" />
                  <Cell fill="#28a745" />
                  <Cell fill="#ffc107" />
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Retirement Account Types */}
        {activeTab === 'accounts' && (
          <div className="chart-section">
            <h3>Retirement Accounts Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ left: 60, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="traditionalIRA"
                  stroke="#007bff"
                  name="Traditional IRA/401k"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="rothIRA"
                  stroke="#28a745"
                  name="Roth IRA/401k"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="investmentAccounts"
                  stroke="#ffc107"
                  name="Investment Accounts"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
