// Asset type definitions with their fields
export const ASSET_TYPES = {
  'primary-residence': {
    label: 'Primary Residence',
    description: 'Your main home',
    icon: '🏠',
    fields: ['currentValue', 'loanBalance', 'loanRate', 'monthlyPayment', 'payoffYear', 'payoffMonth', 'extraPrincipalPayment', 'propertyTax', 'propertyTaxAnnualIncrease', 'insurance', 'insuranceAnnualIncrease', 'appreciationRate', 'sellPlanEnabled', 'sellYear', 'sellMonth'],
  },
  'secondary-residence': {
    label: 'Secondary Residence',
    description: 'Vacation home or investment property',
    icon: '🏡',
    fields: ['currentValue', 'loanBalance', 'loanRate', 'monthlyPayment', 'payoffYear', 'payoffMonth', 'extraPrincipalPayment', 'propertyTax', 'propertyTaxAnnualIncrease', 'insurance', 'insuranceAnnualIncrease', 'rentalIncome', 'rentalIncomeAnnualIncrease', 'annualExpenses', 'annualExpensesAnnualIncrease', 'appreciationRate', 'sellPlanEnabled', 'sellYear', 'sellMonth'],
  },
  'vehicle': {
    label: 'Vehicle/Boat',
    description: 'Car, boat, or other transportation',
    icon: '🚗',
    fields: ['currentValue', 'loanBalance', 'loanRate', 'monthlyPayment', 'payoffYear', 'payoffMonth', 'extraPrincipalPayment', 'insurance', 'insuranceAnnualIncrease', 'annualExpenses', 'annualExpensesAnnualIncrease', 'appreciationRate', 'sellPlanEnabled', 'sellYear', 'sellMonth'],
  },
  'collectible': {
    label: 'Collectible/Precious Metal',
    description: 'Art, jewelry, coins, or other collectibles',
    icon: '💎',
    fields: ['currentValue', 'appreciationRate', 'annualExpenses', 'annualExpensesAnnualIncrease', 'sellPlanEnabled', 'sellYear', 'sellMonth'],
  },
  'generic': {
    label: 'Generic Asset',
    description: 'Other asset',
    icon: '📦',
    fields: ['currentValue', 'appreciationRate', 'annualExpenses', 'annualExpensesAnnualIncrease', 'sellPlanEnabled', 'sellYear', 'sellMonth'],
  },
};

// Field definitions
export const FIELD_DEFINITIONS = {
  assetName: { label: 'Asset Name', type: 'text', placeholder: 'e.g., Primary Home, 2023 Tesla' },
  currentValue: { label: 'Current Value', type: 'number', step: '0.01', min: '0' },

  // Loan fields
  loanBalance: { label: 'Loan/Mortgage Balance', type: 'number', step: '0.01', min: '0' },
  loanRate: { label: 'Loan Interest Rate (%)', type: 'number', step: '0.01', min: '0' },
  monthlyPayment: { label: 'Monthly Payment', type: 'number', step: '0.01', min: '0' },
  payoffYear: { label: 'Payoff Year', type: 'number', min: '2024' },
  payoffMonth: { label: 'Payoff Month (1-12)', type: 'number', min: '1', max: '12' },
  extraPrincipalPayment: { label: 'Extra Principal Payment (Monthly)', type: 'number', step: '0.01', min: '0' },

  // Tax/Insurance fields
  propertyTax: { label: 'Annual Property Tax', type: 'number', step: '0.01', min: '0' },
  propertyTaxAnnualIncrease: { label: 'Property Tax Annual Increase (%)', type: 'number', step: '0.1', min: '0' },
  insurance: { label: 'Annual Insurance', type: 'number', step: '0.01', min: '0' },
  insuranceAnnualIncrease: { label: 'Insurance Annual Increase (%)', type: 'number', step: '0.1', min: '0' },

  // Expenses
  annualExpenses: { label: 'Annual Expenses/Maintenance', type: 'number', step: '0.01', min: '0' },
  annualExpensesAnnualIncrease: { label: 'Expenses Annual Increase (%)', type: 'number', step: '0.1', min: '0' },

  // Rental income
  rentalIncome: { label: 'Annual Rental Income', type: 'number', step: '0.01', min: '0' },
  rentalIncomeAnnualIncrease: { label: 'Rental Income Annual Increase (%)', type: 'number', step: '0.1', min: '0' },

  // Appreciation
  appreciationRate: { label: 'Annual Appreciation/Depreciation (%)', type: 'number', step: '0.1', min: '-100' },

  // Sell plan
  sellPlanEnabled: { label: 'Plan to Sell', type: 'checkbox' },
  sellYear: { label: 'Sale Year', type: 'number', min: '2024' },
  sellMonth: { label: 'Sale Month (1-12)', type: 'number', min: '1', max: '12' },
};
