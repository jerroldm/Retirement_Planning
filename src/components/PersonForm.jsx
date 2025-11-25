import React from 'react';
import { PERSON_TYPES, PERSON_FIELD_DEFINITIONS } from '../config/personConfig';

export default function PersonForm({ person, personType, onSave, onCancel }) {
  const typeConfig = PERSON_TYPES[personType];
  const [formData, setFormData] = React.useState(person || {});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, personType });
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