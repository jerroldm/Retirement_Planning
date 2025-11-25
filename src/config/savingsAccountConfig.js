// Savings account type definitions with their fields
export const ACCOUNT_TYPES = {
  'traditional-ira': {
    label: 'Traditional IRA/401(k)',
    description: 'Tax-deferred retirement account',
    icon: '🏦',
    fields: ['accountName', 'personId', 'currentBalance', 'annualContribution', 'companyMatch', 'stopContributingMode', 'stopContributingAge', 'stopContributingMonth', 'stopContributingYear'],
  },
  'roth-ira': {
    label: 'Roth IRA/401(k)',
    description: 'Tax-free retirement account',
    icon: '💰',
    fields: ['accountName', 'personId', 'currentBalance', 'annualContribution', 'companyMatch', 'stopContributingMode', 'stopContributingAge', 'stopContributingMonth', 'stopContributingYear'],
  },
  'investment-account': {
    label: 'Investment/Brokerage Account',
    description: 'Taxable investment account',
    icon: '📈',
    fields: ['accountName', 'personId', 'currentBalance', 'annualContribution', 'stopContributingMode', 'stopContributingAge', 'stopContributingMonth', 'stopContributingYear'],
  },
  'savings-account': {
    label: 'Savings/Money Market Account',
    description: 'Liquid savings account',
    icon: '🏧',
    fields: ['accountName', 'personId', 'currentBalance', 'annualContribution', 'stopContributingMode', 'stopContributingAge', 'stopContributingMonth', 'stopContributingYear'],
  },
  'other-account': {
    label: 'Other Retirement Account',
    description: 'Other types of savings/investment accounts',
    icon: '💳',
    fields: ['accountName', 'personId', 'currentBalance', 'annualContribution', 'stopContributingMode', 'stopContributingAge', 'stopContributingMonth', 'stopContributingYear'],
  },
};

// Field definitions for all possible account fields
export const FIELD_DEFINITIONS = {
  accountName: { label: 'Account Name', type: 'text', placeholder: 'e.g., Main 401(k), Emergency Fund' },
  personId: { label: 'Account Owner', type: 'select', placeholder: 'Select owner' },
  currentBalance: { label: 'Current Balance', type: 'number', step: '0.01', min: '0' },
  annualContribution: { label: 'Annual Contribution', type: 'number', step: '0.01', min: '0' },
  companyMatch: { label: 'Annual Company Match', type: 'number', step: '0.01', min: '0' },
  stopContributingMode: {
    label: 'Stop Contributing',
    type: 'select',
    options: [
      { value: 'retirement', label: 'At Retirement' },
      { value: 'specific-age', label: 'Specific Age' },
      { value: 'specific-date', label: 'Specific Date' }
    ]
  },
  stopContributingAge: { label: 'Stop Contributing Age', type: 'number', min: '50', max: '100', placeholder: 'e.g., 65' },
  stopContributingMonth: {
    label: 'Stop Contributing Month',
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
  stopContributingYear: {
    label: 'Stop Contributing Year',
    type: 'select',
    options: (() => {
      const years = [];
      for (let year = 2020; year <= 2070; year++) {
        years.push({ value: year, label: year.toString() });
      }
      return years;
    })()
  },
};
