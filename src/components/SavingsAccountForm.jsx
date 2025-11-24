import React, { useState, useEffect } from 'react';
import { ACCOUNT_TYPES, FIELD_DEFINITIONS } from '../config/savingsAccountConfig';
import './SavingsAccountForm.css';

export const SavingsAccountForm = ({ accountType, editingAccount, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    owner: 'Person 1',
    currentBalance: 0,
    annualContribution: 0,
    companyMatch: 0,
  });

  useEffect(() => {
    if (editingAccount) {
      setFormData(editingAccount);
    }
  }, [editingAccount]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      accountType
    });
  };

  const accountConfig = ACCOUNT_TYPES[accountType];
  const fieldsToShow = accountConfig.fields.filter(f => f !== 'accountType');

  return (
    <div className="modal-overlay">
      <div className="modal-content account-form">
        <h2>{editingAccount ? 'Edit Account' : 'Add New Account'}</h2>
        <p className="account-type-label">{accountConfig.label}</p>

        <form onSubmit={handleSubmit}>
          {fieldsToShow.map(fieldName => {
            const fieldConfig = FIELD_DEFINITIONS[fieldName];

            if (fieldConfig.type === 'select') {
              return (
                <div key={fieldName} className="form-group">
                  <label htmlFor={fieldName}>{fieldConfig.label}</label>
                  <select
                    id={fieldName}
                    name={fieldName}
                    value={formData[fieldName] || ''}
                    onChange={handleChange}
                    required
                  >
                    {fieldConfig.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={fieldName} className="form-group">
                <label htmlFor={fieldName}>{fieldConfig.label}</label>
                <input
                  type={fieldConfig.type}
                  id={fieldName}
                  name={fieldName}
                  value={formData[fieldName] || ''}
                  onChange={handleChange}
                  step={fieldConfig.step}
                  min={fieldConfig.min}
                  placeholder={fieldConfig.placeholder}
                  required={fieldName === 'accountName'}
                />
              </div>
            );
          })}

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingAccount ? 'Update Account' : 'Create Account'}
            </button>
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
