import React, { useState } from 'react';

export const ExpensesForm = ({ expense, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: expense?.name || '',
    description: expense?.description || '',
    annualAmount: expense?.annualAmount || '',
    phase: expense?.phase || 'both',
    icon: expense?.icon || '💰',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'annualAmount' ? (value === '' ? '' : parseFloat(value)) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...expense,
      name: formData.name || 'Expense',
      description: formData.description || '',
      annualAmount: formData.annualAmount === '' ? 0 : formData.annualAmount,
      phase: formData.phase,
      icon: formData.icon,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>{expense ? 'Edit Expense' : 'New Expense'}</h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="name">Expense Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Groceries, Utilities, Travel"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="e.g., Monthly grocery expenses"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="annualAmount">Annual Amount</label>
              <input
                id="annualAmount"
                name="annualAmount"
                type="number"
                placeholder="0"
                value={formData.annualAmount}
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
              <label htmlFor="icon">Icon</label>
              <input
                id="icon"
                name="icon"
                type="text"
                placeholder="e.g., 💰"
                value={formData.icon}
                onChange={handleChange}
                maxLength="2"
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
