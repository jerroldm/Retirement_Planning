import React, { useState, useEffect } from 'react';
import { ACCOUNT_TYPES, FIELD_DEFINITIONS } from '../config/savingsAccountConfig';
import './SavingsAccountForm.css';

export const SavingsAccountForm = ({ accountType, editingAccount, onSubmit, onCancel, persons = [] }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    personId: '',
    currentBalance: 0,
    annualContribution: 0,
    companyMatch: 0,
    stopContributingMode: 'retirement',
    stopContributingAge: 0,
    stopContributingMonth: 0,
    stopContributingYear: 0,
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

  // Build owner options from persons list
  const buildOwnerOptions = () => {
    const options = [];

    // Add each person
    if (persons && Array.isArray(persons)) {
      persons.forEach(person => {
        options.push({ value: person.id, label: `${person.firstName} (${person.personType})` });
      });
    }

    return options;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content account-form">
        <h2>{editingAccount ? 'Edit Account' : 'Add New Account'}</h2>
        <p className="account-type-label">{accountConfig.label}</p>

        <form onSubmit={handleSubmit}>
          {fieldsToShow.map((fieldName, index) => {
            const fieldConfig = FIELD_DEFINITIONS[fieldName];

            // Skip stopContributingAge if mode is not 'specific-age'
            if (fieldName === 'stopContributingAge' && formData.stopContributingMode !== 'specific-age') {
              return null;
            }

            // Render month and year together on one row
            if (fieldName === 'stopContributingMonth' && formData.stopContributingMode === 'specific-date') {
              return (
                <div key="date-row" className="form-row">
                  <div className="form-group">
                    <label htmlFor="stopContributingMonth">{FIELD_DEFINITIONS['stopContributingMonth'].label}</label>
                    <select
                      id="stopContributingMonth"
                      name="stopContributingMonth"
                      value={formData['stopContributingMonth'] || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select month --</option>
                      {FIELD_DEFINITIONS['stopContributingMonth'].options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="stopContributingYear">{FIELD_DEFINITIONS['stopContributingYear'].label}</label>
                    <select
                      id="stopContributingYear"
                      name="stopContributingYear"
                      value={formData['stopContributingYear'] || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select year --</option>
                      {FIELD_DEFINITIONS['stopContributingYear'].options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            }

            // Skip stopContributingYear since we handle it with month
            if (fieldName === 'stopContributingYear') {
              return null;
            }

            // Skip stopContributingMonth if mode is not 'specific-date'
            if (fieldName === 'stopContributingMonth' && formData.stopContributingMode !== 'specific-date') {
              return null;
            }

            if (fieldConfig.type === 'select') {
              // Special handling for personId field
              const personOptions = fieldName === 'personId' ? buildOwnerOptions() : fieldConfig.options;

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
                    <option value="">-- Select {fieldName === 'personId' ? 'owner' : 'option'} --</option>
                    {personOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
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
