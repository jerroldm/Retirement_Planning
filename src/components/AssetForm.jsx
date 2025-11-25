import React, { useState, useEffect } from 'react';
import { ASSET_TYPES, FIELD_DEFINITIONS } from '../config/assetConfig';
import './AssetForm.css';

export const AssetForm = ({ assetType, initialData, onSubmit, onCancel, persons = [] }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    personId: '',
    ...Object.fromEntries(ASSET_TYPES[assetType].fields.map(field => [field, '']))
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate asset name
    if (!formData.assetName.trim()) {
      newErrors.assetName = 'Asset name is required';
    }

    // Validate owner
    if (!formData.personId) {
      newErrors.personId = 'Owner is required';
    }

    // Validate required numeric fields
    if (formData.currentValue === '' || formData.currentValue < 0) {
      newErrors.currentValue = 'Current value is required and must be non-negative';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert string values to appropriate types
    const submittedData = {
      assetType,
      ...Object.entries(formData).reduce((acc, [key, value]) => {
        const fieldDef = FIELD_DEFINITIONS[key];
        if (fieldDef && fieldDef.type === 'checkbox') {
          acc[key] = value === true ? 1 : 0;
        } else if (fieldDef && (fieldDef.type === 'number' || fieldDef.type.includes('number'))) {
          acc[key] = value === '' ? null : parseFloat(value);
        } else {
          acc[key] = value || null;
        }
        return acc;
      }, {})
    };

    onSubmit(submittedData);
  };

  const assetConfig = ASSET_TYPES[assetType];
  const isEditing = !!initialData?.id;

  return (
    <div className="modal-overlay">
      <div className="modal-content asset-form">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit' : 'Add'} {assetConfig.label}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Asset Name Field */}
            <div className="form-group">
              <label htmlFor="assetName">
                {FIELD_DEFINITIONS.assetName.label}
                <span className="required">*</span>
              </label>
              <input
                id="assetName"
                type="text"
                name="assetName"
                placeholder={FIELD_DEFINITIONS.assetName.placeholder}
                value={formData.assetName}
                onChange={handleInputChange}
                className={errors.assetName ? 'input-error' : ''}
              />
              {errors.assetName && <span className="error-message">{errors.assetName}</span>}
            </div>

            {/* Person/Owner Selector */}
            <div className="form-group">
              <label htmlFor="personId">
                Owner
                <span className="required">*</span>
              </label>
              <select
                id="personId"
                name="personId"
                value={formData.personId}
                onChange={handleInputChange}
                className={errors.personId ? 'input-error' : ''}
                required
              >
                <option value="">-- Select owner --</option>
                {persons && Array.isArray(persons) && persons.length > 0 ? (
                  persons.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} ({person.personType})
                    </option>
                  ))
                ) : (
                  <option disabled>No persons available</option>
                )}
              </select>
              {errors.personId && <span className="error-message">{errors.personId}</span>}
            </div>

            {/* Dynamic Fields based on Asset Type - Structured Layout */}
            <div className="form-fields-structured">
              {/* Helper function to render a single field */}
              {(() => {
                const renderField = (fieldName) => {
                  if (!fieldName || !assetConfig.fields.includes(fieldName)) return null;

                  const fieldDef = FIELD_DEFINITIONS[fieldName];
                  if (!fieldDef) return null;

                  const isCheckbox = fieldDef.type === 'checkbox';
                  const value = formData[fieldName];

                  return (
                    <div key={fieldName} className="form-group">
                      <label htmlFor={fieldName}>
                        {fieldDef.label}
                      </label>
                      {isCheckbox ? (
                        <input
                          id={fieldName}
                          type="checkbox"
                          name={fieldName}
                          checked={value === true || value === 1}
                          onChange={handleInputChange}
                          className="checkbox-input"
                        />
                      ) : (
                        <input
                          id={fieldName}
                          type={fieldDef.type}
                          name={fieldName}
                          placeholder={fieldDef.placeholder || ''}
                          value={value}
                          onChange={handleInputChange}
                          step={fieldDef.step || 'any'}
                          min={fieldDef.min}
                          max={fieldDef.max}
                          className={errors[fieldName] ? 'input-error' : ''}
                        />
                      )}
                      {errors[fieldName] && <span className="error-message">{errors[fieldName]}</span>}
                    </div>
                  );
                };

                const renderPair = (field1, field2) => {
                  if (!field1 || !assetConfig.fields.includes(field1)) return null;

                  return (
                    <div key={`${field1}-${field2}`} className="form-group-pair">
                      {renderField(field1)}
                      {field2 && assetConfig.fields.includes(field2) ? renderField(field2) : null}
                    </div>
                  );
                };

                const renderTriple = (field1, field2, field3) => {
                  if (!field1 || !assetConfig.fields.includes(field1)) return null;

                  // Special handling for sell plan checkbox with date fields
                  if (field1 === 'sellPlanEnabled') {
                    const fieldDef1 = FIELD_DEFINITIONS[field1];
                    const fieldDef2 = field2 ? FIELD_DEFINITIONS[field2] : null;
                    const fieldDef3 = field3 ? FIELD_DEFINITIONS[field3] : null;
                    const value1 = formData[field1];
                    const value2 = field2 ? formData[field2] : null;
                    const value3 = field3 ? formData[field3] : null;

                    return (
                      <div key={`${field1}-${field2}-${field3}`} className="form-group-sell-plan">
                        <div className="sell-plan-header">
                          <label htmlFor={field1}>
                            {fieldDef1.label}
                          </label>
                          <input
                            id={field1}
                            type="checkbox"
                            name={field1}
                            checked={value1 === true || value1 === 1}
                            onChange={handleInputChange}
                            className="checkbox-input"
                          />
                        </div>
                        <div className="sell-plan-dates">
                          {field2 && assetConfig.fields.includes(field2) && fieldDef2 ? (
                            <div className="form-group">
                              <label htmlFor={field2}>
                                {fieldDef2.label}
                              </label>
                              <input
                                id={field2}
                                type={fieldDef2.type}
                                name={field2}
                                placeholder={fieldDef2.placeholder || ''}
                                value={value2}
                                onChange={handleInputChange}
                                step={fieldDef2.step || 'any'}
                                min={fieldDef2.min}
                                max={fieldDef2.max}
                                className={errors[field2] ? 'input-error' : ''}
                              />
                              {errors[field2] && <span className="error-message">{errors[field2]}</span>}
                            </div>
                          ) : null}
                          {field3 && assetConfig.fields.includes(field3) && fieldDef3 ? (
                            <div className="form-group">
                              <label htmlFor={field3}>
                                {fieldDef3.label}
                              </label>
                              <input
                                id={field3}
                                type={fieldDef3.type}
                                name={field3}
                                placeholder={fieldDef3.placeholder || ''}
                                value={value3}
                                onChange={handleInputChange}
                                step={fieldDef3.step || 'any'}
                                min={fieldDef3.min}
                                max={fieldDef3.max}
                                className={errors[field3] ? 'input-error' : ''}
                              />
                              {errors[field3] && <span className="error-message">{errors[field3]}</span>}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${field1}-${field2}-${field3}`} className="form-group-triple">
                      {renderField(field1)}
                      {field2 && assetConfig.fields.includes(field2) ? renderField(field2) : null}
                      {field3 && assetConfig.fields.includes(field3) ? renderField(field3) : null}
                    </div>
                  );
                };

                return (
                  <>
                    {/* Line 2: Current Value, Balance */}
                    {renderPair('currentValue', 'loanBalance')}

                    {/* Line 3: Interest Rate, Monthly Payment */}
                    {renderPair('loanRate', 'monthlyPayment')}

                    {/* Line 4: Payoff Year, Month */}
                    {renderPair('payoffYear', 'payoffMonth')}

                    {/* Line 5: Extra Principal, Appreciation */}
                    {renderPair('extraPrincipalPayment', 'appreciationRate')}

                    {/* Line 6: Property Tax, Increase */}
                    {renderPair('propertyTax', 'propertyTaxAnnualIncrease')}

                    {/* Line 7: Insurance, Increase */}
                    {renderPair('insurance', 'insuranceAnnualIncrease')}

                    {/* Line 8: Plan to Sell, Year, Month */}
                    {renderTriple('sellPlanEnabled', 'sellYear', 'sellMonth')}

                    {/* Remaining fields (annual expenses, rental income, etc.) */}
                    {(() => {
                      const renderedFields = new Set([
                        'currentValue', 'loanBalance', 'loanRate', 'monthlyPayment',
                        'payoffYear', 'payoffMonth', 'extraPrincipalPayment', 'appreciationRate',
                        'propertyTax', 'propertyTaxAnnualIncrease',
                        'insurance', 'insuranceAnnualIncrease',
                        'sellPlanEnabled', 'sellYear', 'sellMonth'
                      ]);

                      return (
                        <div className="form-fields-remaining">
                          {assetConfig.fields.filter(f => !renderedFields.has(f)).map(fieldName => {
                            return renderField(fieldName);
                          })}
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEditing ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
