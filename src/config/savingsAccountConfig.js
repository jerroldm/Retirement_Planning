// Savings account type definitions with their fields
export const ACCOUNT_TYPES = {
  'traditional-ira': {
    label: 'Traditional IRA/401(k)',
    description: 'Tax-deferred retirement account',
    icon: '🏦',
    fields: ['accountName', 'owner', 'currentBalance', 'annualContribution', 'companyMatch'],
  },
  'roth-ira': {
    label: 'Roth IRA/401(k)',
    description: 'Tax-free retirement account',
    icon: '💰',
    fields: ['accountName', 'owner', 'currentBalance', 'annualContribution', 'companyMatch'],
  },
  'investment-account': {
    label: 'Investment/Brokerage Account',
    description: 'Taxable investment account',
    icon: '📈',
    fields: ['accountName', 'owner', 'currentBalance', 'annualContribution'],
  },
  'savings-account': {
    label: 'Savings/Money Market Account',
    description: 'Liquid savings account',
    icon: '🏧',
    fields: ['accountName', 'owner', 'currentBalance', 'annualContribution'],
  },
  'other-account': {
    label: 'Other Retirement Account',
    description: 'Other types of savings/investment accounts',
    icon: '💳',
    fields: ['accountName', 'owner', 'currentBalance', 'annualContribution'],
  },
};

// Field definitions for all possible account fields
export const FIELD_DEFINITIONS = {
  accountName: { label: 'Account Name', type: 'text', placeholder: 'e.g., Main 401(k), Emergency Fund' },
  owner: { label: 'Account Owner', type: 'select', options: ['Person 1', 'Person 2'], placeholder: 'Select owner' },
  currentBalance: { label: 'Current Balance', type: 'number', step: '0.01', min: '0' },
  annualContribution: { label: 'Annual Contribution', type: 'number', step: '0.01', min: '0' },
  companyMatch: { label: 'Annual Company Match', type: 'number', step: '0.01', min: '0' },
};
