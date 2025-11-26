import React, { useState } from 'react';

export const IncomeForm = ({ source, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sourceName: source?.sourceName || '',
    annualSalary: source?.annualSalary || '',
    annualSalaryIncrease: source?.annualSalaryIncrease || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'sourceName' ? value : (value === '' ? '' : parseFloat(value)),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...source,
      sourceName: formData.sourceName || 'Income Source',
      annualSalary: formData.annualSalary === '' ? 0 : formData.annualSalary,
      annualSalaryIncrease: formData.annualSalaryIncrease === '' ? 0 : formData.annualSalaryIncrease,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>{source ? 'Edit Income Source' : 'New Income Source'}</h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="sourceName">Source Name</label>
              <input
                id="sourceName"
                name="sourceName"
                type="text"
                placeholder="e.g., Salary, Bonus, Investment Income"
                value={formData.sourceName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="annualSalary">Annual Salary</label>
              <input
                id="annualSalary"
                name="annualSalary"
                type="number"
                placeholder="0"
                value={formData.annualSalary}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="annualSalaryIncrease">Annual Salary Increase (%)</label>
              <input
                id="annualSalaryIncrease"
                name="annualSalaryIncrease"
                type="number"
                placeholder="0"
                value={formData.annualSalaryIncrease}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Income Source
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
