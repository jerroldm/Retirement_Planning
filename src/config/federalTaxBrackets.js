/**
 * Federal Tax Brackets and Standard Deductions for 2025
 * Based on IRS published rates for Tax Year 2025
 */

export const federalTaxBrackets2025 = {
  single: [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  'married-joint': [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  'married-separate': [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 365600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  'head-of-household': [
    { limit: 16550, rate: 0.10 },
    { limit: 63100, rate: 0.12 },
    { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243700, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ]
};

export const standardDeductions2025 = {
  single: 14600,
  'married-joint': 29200,
  'married-separate': 14600,
  'head-of-household': 21900
};

/**
 * Long-term capital gains tax brackets for 2025
 * Based on income thresholds, not absolute tax brackets
 */
export const capitalGainsBrackets2025 = {
  single: [
    { threshold: 47025, rate: 0.0 },      // 0% rate
    { threshold: 518900, rate: 0.15 },    // 15% rate
    { threshold: Infinity, rate: 0.20 }   // 20% rate
  ],
  'married-joint': [
    { threshold: 94050, rate: 0.0 },      // 0% rate
    { threshold: 583750, rate: 0.15 },    // 15% rate
    { threshold: Infinity, rate: 0.20 }   // 20% rate
  ],
  'married-separate': [
    { threshold: 47025, rate: 0.0 },      // 0% rate
    { threshold: 291875, rate: 0.15 },    // 15% rate
    { threshold: Infinity, rate: 0.20 }   // 20% rate
  ],
  'head-of-household': [
    { threshold: 62975, rate: 0.0 },      // 0% rate
    { threshold: 551350, rate: 0.15 },    // 15% rate
    { threshold: Infinity, rate: 0.20 }   // 20% rate
  ]
};

/**
 * Social Security Taxation Thresholds for 2025
 * Combined income = AGI + 50% of Social Security benefits
 */
export const socialSecurityThresholds2025 = {
  single: {
    firstThreshold: 25000,      // 50% of SS becomes taxable above this
    secondThreshold: 34000      // 85% of SS becomes taxable above this
  },
  'married-joint': {
    firstThreshold: 32000,      // 50% of SS becomes taxable above this
    secondThreshold: 44000      // 85% of SS becomes taxable above this
  },
  'married-separate': {
    firstThreshold: 0,          // Any combined income triggers taxation
    secondThreshold: 0
  }
};
