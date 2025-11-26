import React, { useState } from 'react';

export const SocialSecurityForm = ({ record, persons, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    personId: record?.personId || '',
    estimatedAnnualBenefit: record?.estimatedAnnualBenefit || '',
    plannedClaimingAge: record?.plannedClaimingAge || 67,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'personId' ? parseInt(value) : (name === 'plannedClaimingAge' ? parseInt(value) : (name === 'estimatedAnnualBenefit' ? (value === '' ? '' : parseFloat(value)) : value)),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      personId: formData.personId,
      estimatedAnnualBenefit: formData.estimatedAnnualBenefit === '' ? 0 : formData.estimatedAnnualBenefit,
      plannedClaimingAge: formData.plannedClaimingAge || 67,
    });
  };

  // Get person name for display
  const selectedPerson = persons?.find(p => p.id === formData.personId);
  const personName = selectedPerson ? selectedPerson.firstName : 'Unknown';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <h3>{record ? 'Edit Social Security' : 'New Social Security Record'}</h3>
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="personId">Person</label>
              <select
                id="personId"
                name="personId"
                value={formData.personId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Person --</option>
                {persons?.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} ({person.personType === 'self' ? 'Self' : 'Spouse'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedAnnualBenefit">Estimated Annual Benefit at FRA (Age 67)</label>
              <input
                id="estimatedAnnualBenefit"
                name="estimatedAnnualBenefit"
                type="number"
                placeholder="0"
                value={formData.estimatedAnnualBenefit}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="plannedClaimingAge">Planned Claiming Age</label>
              <input
                id="plannedClaimingAge"
                name="plannedClaimingAge"
                type="number"
                value={formData.plannedClaimingAge}
                onChange={handleChange}
                min="62"
                max="70"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {record ? 'Update' : 'Add'} Social Security
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
