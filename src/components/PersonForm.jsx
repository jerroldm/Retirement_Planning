import React from 'react';
import { PERSON_TYPES, PERSON_FIELD_DEFINITIONS } from '../config/personConfig';

export default function PersonForm({ person, personType, onSave, onCancel }) {
  // Normalize 'primary' to 'self' for backward compatibility with old database records
  const normalizedPersonType = personType === 'primary' ? 'self' : personType;
  const typeConfig = PERSON_TYPES[normalizedPersonType];
  const [formData, setFormData] = React.useState(person || {});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseFloat(value) : '') : value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, personType: normalizedPersonType });
  };

  const renderField = (fieldName) => {
    const fieldDef = PERSON_FIELD_DEFINITIONS[fieldName];
    const value = formData[fieldName] || '';

    if (fieldDef.type === 'select') {
      return (
        <div key={fieldName} className="form-group">
          <label htmlFor={fieldName}>{fieldDef.label}</label>
          <select
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            {fieldDef.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={fieldName} className="form-group">
        <label htmlFor={fieldName}>{fieldDef.label}</label>
        <input
          id={fieldName}
          name={fieldName}
          type={fieldDef.type}
          placeholder={fieldDef.placeholder}
          value={value}
          onChange={handleChange}
          step={fieldDef.step}
          min={fieldDef.min}
          max={fieldDef.max}
        />
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>
          {person ? 'Edit' : 'Add'} {typeConfig.label}
        </h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            {typeConfig.fields.map((fieldName) =>
              renderField(fieldName)
            )}
          </div>

          {/* Include in Calculations Checkbox */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="includeInCalculations" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="includeInCalculations"
                name="includeInCalculations"
                type="checkbox"
                checked={formData.includeInCalculations !== false}
                onChange={handleChange}
              />
              Include in Retirement Calculations
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {person ? 'Update' : 'Add'} Person
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
}