import React, { useState } from 'react';

export const IncomeForm = ({ person, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    currentSalary: person?.currentSalary || '',
    annualSalaryIncrease: person?.annualSalaryIncrease || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? '' : (name === 'currentSalary' ? parseFloat(value) : parseFloat(value)),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...person,
      currentSalary: formData.currentSalary === '' ? 0 : formData.currentSalary,
      annualSalaryIncrease: formData.annualSalaryIncrease === '' ? 0 : formData.annualSalaryIncrease,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>Edit Income - {person?.firstName}</h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="currentSalary">Current Annual Salary</label>
              <input
                id="currentSalary"
                name="currentSalary"
                type="number"
                placeholder="0"
                value={formData.currentSalary}
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
              Update Income
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
