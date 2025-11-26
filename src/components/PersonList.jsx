import React from 'react';
import { PERSON_TYPES } from '../config/personConfig';
import './PersonList.css';

export const PersonList = ({ persons, onEdit, onDelete, onAddPerson }) => {
  const handleDelete = (personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      onDelete(personId);
    }
  };

  const hasPersons = persons.length > 0;

  if (!hasPersons) {
    return (
      <div className="persons-list">
        <div className="persons-list-empty">
          <p>No people yet.</p>
          <button className="btn-add-person" onClick={onAddPerson}>
            + Add your first person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="persons-list">
      <div className="persons-list-header">
        <h2>Your People</h2>
        <button className="btn-add-person" onClick={onAddPerson}>
          + Add Person
        </button>
      </div>
        <div className="persons-container">
          {persons.map(person => {
            const personConfig = PERSON_TYPES[person.personType];
            const currentAge = person.birthYear ? calculateAge(person.birthMonth, person.birthYear) : '--';

            return (
              <div key={person.id} className="person-card">
                <div className="person-header">
                  <div className="person-info">
                    <span className="person-icon">{personConfig?.icon}</span>
                    <div>
                      <h5>{person.firstName}</h5>
                      <p className="person-type">{personConfig?.label}</p>
                    </div>
                  </div>
                  <div className="person-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => onEdit(person)}
                      title="Edit person"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(person.id)}
                      title="Delete person"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="person-details">
                  {person.birthYear && (
                    <div className="detail-row">
                      <span className="label">Age:</span>
                      <span className="value">{currentAge}</span>
                    </div>
                  )}
                  {person.retirementAge && (
                    <div className="detail-row">
                      <span className="label">Retirement Age:</span>
                      <span className="value">{person.retirementAge}</span>
                    </div>
                  )}
                  {person.currentSalary > 0 && (
                    <div className="detail-row">
                      <span className="label">Current Salary:</span>
                      <span className="value">${person.currentSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
};

// Helper function to calculate age
function calculateAge(birthMonth, birthYear) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth) {
    age--;
  }

  return age;
}
