// Person type definitions with their fields
export const PERSON_TYPES = {
  'primary': {
    label: 'Primary Person',
    description: 'Main household member',
    icon: '👤',
    fields: ['firstName', 'birthMonth', 'birthYear', 'retirementAge', 'deathAge'],
  },
  'spouse': {
    label: 'Spouse',
    description: 'Spouse or domestic partner',
    icon: '💑',
    fields: ['firstName', 'birthMonth', 'birthYear', 'retirementAge', 'deathAge'],
  },
};

// Field definitions for persons
export const PERSON_FIELD_DEFINITIONS = {
  firstName: { label: 'Name', type: 'text', placeholder: 'e.g., John' },

  // Birth information
  birthMonth: {
    label: 'Birth Month',
    type: 'select',
    options: [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' },
    ]
  },
  birthYear: { label: 'Birth Year', type: 'number', min: '1920', max: '2024' },

  // Retirement planning
  retirementAge: { label: 'Target Retirement Age', type: 'number', min: '50', max: '100' },
  deathAge: { label: 'Life Expectancy', type: 'number', min: '70', max: '120' },
};
