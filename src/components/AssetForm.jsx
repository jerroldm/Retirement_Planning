import React, { useState, useEffect } from 'react';
import { ASSET_TYPES, FIELD_DEFINITIONS } from '../config/assetConfig';
import './AssetForm.css';

export const AssetForm = ({ assetType, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    assetName: '',
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

            {/* Dynamic Fields based on Asset Type */}
            <div className="form-fields">
              {assetConfig.fields.map((fieldName, index) => {
                const fieldDef = FIELD_DEFINITIONS[fieldName];
                if (!fieldDef) return null;

                const isCheckbox = fieldDef.type === 'checkbox';
                const value = formData[fieldName];

                // Fields that should always be on their own line
                const fullWidthFields = ['propertyTax', 'propertyTaxAnnualIncrease', 'insurance', 'insuranceAnnualIncrease'];
                const isFullWidth = fullWidthFields.includes(fieldName);

                return (
                  <div
                    key={fieldName}
                    className={`form-group ${isFullWidth ? 'full-width' : ''}`}
                  >
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
              })}
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
