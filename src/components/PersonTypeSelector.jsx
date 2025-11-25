import { PERSON_TYPES } from '../config/personConfig';

export default function PersonTypeSelector({ onSelect, onCancel, existingTypes = [] }) {
  const availableTypes = Object.entries(PERSON_TYPES).filter(
    ([key]) => !existingTypes.includes(key)
  );

  if (availableTypes.length === 0) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Add Person</h3>
          <p>All available person types have been added.</p>
          <button onClick={onCancel} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Select Person Type</h3>
        <p>Choose the type of person to add:</p>
        <div className="type-selector">
          {availableTypes.map(([key, type]) => (
            <button
              key={key}
              className="type-option"
              onClick={() => onSelect(key)}
            >
              <div className="type-icon">{type.icon}</div>
              <div className="type-info">
                <div className="type-label">{type.label}</div>
                <div className="type-description">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
