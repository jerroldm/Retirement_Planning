import React from 'react';
import './ExpensesList.css';

export const ExpensesList = ({ expenses, onEdit, onDelete, onAddExpense }) => {
  const hasExpenses = expenses && expenses.length > 0;

  if (!hasExpenses) {
    return (
      <div className="expenses-list">
        <div className="expenses-list-empty">
          <p>No expenses yet.</p>
          <button className="btn-add-expense" onClick={onAddExpense}>
            + Add your first expense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="expenses-list">
      <div className="expenses-list-header">
        <h2>Your Expenses</h2>
        <button className="btn-add-expense" onClick={onAddExpense}>
          + Add Expense
        </button>
      </div>
      <div className="expenses-container">
        {expenses.map(expense => {
          // Compute phase from preRetirement/postRetirement booleans
          // Note: SQLite returns 0/1, so we use !! to convert to boolean
          const pre = !!expense.preRetirement;
          const post = !!expense.postRetirement;
          let phaseDisplay = 'Pre & Post-Retirement';
          if (pre && !post) {
            phaseDisplay = 'Pre-Retirement Only';
          } else if (!pre && post) {
            phaseDisplay = 'Post-Retirement Only';
          }

          return (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <div className="expense-info">
                  <div>
                    <h5>{expense.expenseName}</h5>
                    {expense.notes && <p className="expense-type">{expense.notes}</p>}
                  </div>
                </div>
                <div className="expense-actions">
                  <button
                    className="btn-icon edit"
                    onClick={() => onEdit(expense)}
                    title="Edit expense"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => onDelete(expense.id)}
                    title="Delete expense"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="expense-details">
                <div className="detail-row">
                  <span className="label">Monthly Amount:</span>
                  <span className="value">
                    ${(expense.monthlyAmount || expense.annualAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Phase:</span>
                  <span className="value">{phaseDisplay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
