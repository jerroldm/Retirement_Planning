import React, { useState } from 'react';

export const ExpensesForm = ({ expense, onSave, onCancel }) => {
  // Convert database format (preRetirement/postRetirement booleans) to UI format (phase string)
  // Note: SQLite returns 0/1, not true/false, so we use !! to convert to boolean
  const getPhaseFromExpense = (exp) => {
    if (!exp) return 'both';
    const pre = !!exp.preRetirement;
    const post = !!exp.postRetirement;
    if (pre && post) return 'both';
    if (pre) return 'pre';
    if (post) return 'post';
    return 'both';
  };

  const [formData, setFormData] = useState({
    expenseName: expense?.expenseName || '',
    monthlyAmount: expense?.monthlyAmount || '',
    phase: getPhaseFromExpense(expense),
    notes: expense?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'monthlyAmount' ? (value === '' ? '' : parseFloat(value)) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert UI format (phase string) to database format (preRetirement/postRetirement booleans)
    let preRetirement = true;
    let postRetirement = true;
    if (formData.phase === 'pre') postRetirement = false;
    if (formData.phase === 'post') preRetirement = false;

    onSave({
      expenseName: formData.expenseName || 'Expense',
      monthlyAmount: formData.monthlyAmount === '' ? 0 : formData.monthlyAmount,
      preRetirement,
      postRetirement,
      notes: formData.notes || '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>{expense ? 'Edit Expense' : 'New Expense'}</h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="expenseName">Expense Name</label>
              <input
                id="expenseName"
                name="expenseName"
                type="text"
                placeholder="e.g., Groceries, Utilities, Travel"
                value={formData.expenseName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthlyAmount">Monthly Amount</label>
              <input
                id="monthlyAmount"
                name="monthlyAmount"
                type="number"
                placeholder="0"
                value={formData.monthlyAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phase">Phase</label>
              <select
                id="phase"
                name="phase"
                value={formData.phase}
                onChange={handleChange}
              >
                <option value="both">Pre & Post-Retirement</option>
                <option value="pre">Pre-Retirement Only</option>
                <option value="post">Post-Retirement Only</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <input
                id="notes"
                name="notes"
                type="text"
                placeholder="e.g., Optional notes about this expense"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Expense
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
