import React from 'react';
import { PERSON_TYPES } from '../config/personConfig';
import './IncomeList.css';

export const IncomeList = ({ persons, onEdit, onAddPerson }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const hasPersons = persons.length > 0;

  return (
    <div className="income-list">
      {!hasPersons && (
        <div className="empty-state">
          <p>No persons added yet. Add a person in the Personal tab to configure income.</p>
        </div>
      )}

      {hasPersons && (
        <div className="income-container">
          {persons.map(person => {
            const personConfig = PERSON_TYPES[person.personType];

            return (
              <div key={person.id} className="income-card">
                <div className="income-header">
                  <div className="income-info">
                    <span className="income-icon">{personConfig?.icon}</span>
                    <div>
                      <h5>{person.firstName}</h5>
                      <p className="person-type">{personConfig?.label}</p>
                    </div>
                  </div>
                  <button
                    className="btn-icon edit"
                    onClick={() => onEdit(person)}
                    title="Edit income"
                  >
                    ✎
                  </button>
                </div>

                <div className="income-details">
                  <div className="detail-row">
                    <span className="label">Current Annual Salary:</span>
                    <span className="value">{formatCurrency(person.currentSalary)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Annual Salary Increase:</span>
                    <span className="value">{person.annualSalaryIncrease || 0}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
