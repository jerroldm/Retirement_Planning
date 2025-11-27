/**
 * State Tax Configuration for all 50 states + DC
 * Includes tax brackets, flat rates, and special retirement income treatment
 * 2025 tax year data
 */

export const stateTaxData = {
  AL: {
    name: 'Alabama',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 500, rate: 0.02 },
        { limit: 3000, rate: 0.04 },
        { limit: Infinity, rate: 0.05 }
      ],
      'married-joint': [
        { limit: 1000, rate: 0.02 },
        { limit: 6000, rate: 0.04 },
        { limit: Infinity, rate: 0.05 }
      ]
    }
  },
  AK: { name: 'Alaska', hasBrackets: false, flatRate: 0.00 },
  AZ: {
    name: 'Arizona',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 30719, rate: 0.0259 },
        { limit: 74899, rate: 0.032 },
        { limit: 161903, rate: 0.045 },
        { limit: Infinity, rate: 0.0545 }
      ],
      'married-joint': [
        { limit: 61438, rate: 0.0259 },
        { limit: 149798, rate: 0.032 },
        { limit: 323806, rate: 0.045 },
        { limit: Infinity, rate: 0.0545 }
      ]
    }
  },
  AR: {
    name: 'Arkansas',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 4300, rate: 0.02 },
        { limit: 8599, rate: 0.04 },
        { limit: 13199, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 8600, rate: 0.02 },
        { limit: 17199, rate: 0.04 },
        { limit: 26399, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  CA: {
    name: 'California',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 10412, rate: 0.01 },
        { limit: 24684, rate: 0.02 },
        { limit: 38942, rate: 0.04 },
        { limit: 54081, rate: 0.06 },
        { limit: 68541, rate: 0.08 },
        { limit: 84846, rate: 0.093 },
        { limit: 118468, rate: 0.103 },
        { limit: 673902, rate: 0.113 },
        { limit: 822472, rate: 0.123 },
        { limit: Infinity, rate: 0.133 }
      ],
      'married-joint': [
        { limit: 20824, rate: 0.01 },
        { limit: 49368, rate: 0.02 },
        { limit: 77884, rate: 0.04 },
        { limit: 108162, rate: 0.06 },
        { limit: 137082, rate: 0.08 },
        { limit: 169692, rate: 0.093 },
        { limit: 236936, rate: 0.103 },
        { limit: 1347804, rate: 0.113 },
        { limit: 1644944, rate: 0.123 },
        { limit: Infinity, rate: 0.133 }
      ]
    }
  },
  CO: {
    name: 'Colorado',
    hasBrackets: false,
    flatRate: 0.0435
  },
  CT: {
    name: 'Connecticut',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 21000, rate: 0.03 },
        { limit: 53000, rate: 0.05 },
        { limit: Infinity, rate: 0.0635 }
      ],
      'married-joint': [
        { limit: 42000, rate: 0.03 },
        { limit: 106000, rate: 0.05 },
        { limit: Infinity, rate: 0.0635 }
      ]
    }
  },
  DE: {
    name: 'Delaware',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 2000, rate: 0.022 },
        { limit: 5000, rate: 0.039 },
        { limit: 10000, rate: 0.048 },
        { limit: 20000, rate: 0.052 },
        { limit: 25000, rate: 0.0555 },
        { limit: 60000, rate: 0.06 },
        { limit: Infinity, rate: 0.066 }
      ],
      'married-joint': [
        { limit: 3000, rate: 0.022 },
        { limit: 7500, rate: 0.039 },
        { limit: 15000, rate: 0.048 },
        { limit: 30000, rate: 0.052 },
        { limit: 37500, rate: 0.0555 },
        { limit: 90000, rate: 0.06 },
        { limit: Infinity, rate: 0.066 }
      ]
    }
  },
  FL: { name: 'Florida', hasBrackets: false, flatRate: 0.00 },
  GA: {
    name: 'Georgia',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1050, rate: 0.01 },
        { limit: 2450, rate: 0.02 },
        { limit: 3650, rate: 0.03 },
        { limit: 5850, rate: 0.04 },
        { limit: 7000, rate: 0.05 },
        { limit: 10200, rate: 0.0555 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 1750, rate: 0.01 },
        { limit: 3750, rate: 0.02 },
        { limit: 5650, rate: 0.03 },
        { limit: 7750, rate: 0.04 },
        { limit: 10000, rate: 0.05 },
        { limit: 14000, rate: 0.0555 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  HI: {
    name: 'Hawaii',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1288, rate: 0.014 },
        { limit: 3072, rate: 0.032 },
        { limit: 5456, rate: 0.055 },
        { limit: 8584, rate: 0.064 },
        { limit: 12500, rate: 0.068 },
        { limit: Infinity, rate: 0.0685 }
      ],
      'married-joint': [
        { limit: 2176, rate: 0.014 },
        { limit: 5104, rate: 0.032 },
        { limit: 8912, rate: 0.055 },
        { limit: 12672, rate: 0.064 },
        { limit: 20000, rate: 0.068 },
        { limit: Infinity, rate: 0.0685 }
      ]
    }
  },
  ID: {
    name: 'Idaho',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1919, rate: 0.01 },
        { limit: 3839, rate: 0.03 },
        { limit: 5759, rate: 0.045 },
        { limit: 7679, rate: 0.0525 },
        { limit: 9599, rate: 0.063 },
        { limit: 11519, rate: 0.0685 },
        { limit: Infinity, rate: 0.0725 }
      ],
      'married-joint': [
        { limit: 3838, rate: 0.01 },
        { limit: 7678, rate: 0.03 },
        { limit: 11518, rate: 0.045 },
        { limit: 15358, rate: 0.0525 },
        { limit: 19198, rate: 0.063 },
        { limit: 23038, rate: 0.0685 },
        { limit: Infinity, rate: 0.0725 }
      ]
    }
  },
  IL: {
    name: 'Illinois',
    hasBrackets: false,
    flatRate: 0.0495
  },
  IN: {
    name: 'Indiana',
    hasBrackets: false,
    flatRate: 0.0365
  },
  IA: {
    name: 'Iowa',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1839, rate: 0.00 },
        { limit: 13687, rate: 0.045 },
        { limit: 32962, rate: 0.0675 },
        { limit: Infinity, rate: 0.0875 }
      ],
      'married-joint': [
        { limit: 3679, rate: 0.00 },
        { limit: 27374, rate: 0.045 },
        { limit: 65924, rate: 0.0675 },
        { limit: Infinity, rate: 0.0875 }
      ]
    }
  },
  KS: {
    name: 'Kansas',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 15000, rate: 0.057 },
        { limit: 30000, rate: 0.063 },
        { limit: Infinity, rate: 0.085 }
      ],
      'married-joint': [
        { limit: 30000, rate: 0.057 },
        { limit: 60000, rate: 0.063 },
        { limit: Infinity, rate: 0.085 }
      ]
    }
  },
  KY: {
    name: 'Kentucky',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3000, rate: 0.02 },
        { limit: 4000, rate: 0.035 },
        { limit: 5000, rate: 0.045 },
        { limit: 8000, rate: 0.0475 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 6000, rate: 0.02 },
        { limit: 8000, rate: 0.035 },
        { limit: 10000, rate: 0.045 },
        { limit: 16000, rate: 0.0475 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  LA: {
    name: 'Louisiana',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 12500, rate: 0.02 },
        { limit: 50000, rate: 0.04 },
        { limit: Infinity, rate: 0.06 }
      ],
      'married-joint': [
        { limit: 25000, rate: 0.02 },
        { limit: 100000, rate: 0.04 },
        { limit: Infinity, rate: 0.06 }
      ]
    }
  },
  ME: {
    name: 'Maine',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 23000, rate: 0.055 },
        { limit: 54450, rate: 0.069 },
        { limit: Infinity, rate: 0.0715 }
      ],
      'married-joint': [
        { limit: 36800, rate: 0.055 },
        { limit: 87100, rate: 0.069 },
        { limit: Infinity, rate: 0.0715 }
      ]
    }
  },
  MD: {
    name: 'Maryland',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1000, rate: 0.02 },
        { limit: 2000, rate: 0.03 },
        { limit: 3000, rate: 0.04 },
        { limit: 100000, rate: 0.0475 },
        { limit: 125000, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 1000, rate: 0.02 },
        { limit: 2000, rate: 0.03 },
        { limit: 3000, rate: 0.04 },
        { limit: 150000, rate: 0.0475 },
        { limit: 175000, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  MA: {
    name: 'Massachusetts',
    hasBrackets: false,
    flatRate: 0.05
  },
  MI: {
    name: 'Michigan',
    hasBrackets: false,
    flatRate: 0.0425
  },
  MN: {
    name: 'Minnesota',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 28925, rate: 0.0535 },
        { limit: 116863, rate: 0.0705 },
        { limit: 211610, rate: 0.0785 },
        { limit: Infinity, rate: 0.0985 }
      ],
      'married-joint': [
        { limit: 38415, rate: 0.0535 },
        { limit: 154984, rate: 0.0705 },
        { limit: 270948, rate: 0.0785 },
        { limit: Infinity, rate: 0.0985 }
      ]
    }
  },
  MS: {
    name: 'Mississippi',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3000, rate: 0.03 },
        { limit: 5000, rate: 0.04 },
        { limit: 10000, rate: 0.05 },
        { limit: Infinity, rate: 0.05 }
      ],
      'married-joint': [
        { limit: 6000, rate: 0.03 },
        { limit: 10000, rate: 0.04 },
        { limit: 20000, rate: 0.05 },
        { limit: Infinity, rate: 0.05 }
      ]
    }
  },
  MO: {
    name: 'Missouri',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1073, rate: 0.015 },
        { limit: 3219, rate: 0.02 },
        { limit: 5365, rate: 0.0225 },
        { limit: 7511, rate: 0.03 },
        { limit: 9657, rate: 0.0325 },
        { limit: 11803, rate: 0.035 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 2146, rate: 0.015 },
        { limit: 6438, rate: 0.02 },
        { limit: 10730, rate: 0.0225 },
        { limit: 15022, rate: 0.03 },
        { limit: 19314, rate: 0.0325 },
        { limit: 23606, rate: 0.035 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  MT: {
    name: 'Montana',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3300, rate: 0.01 },
        { limit: 8000, rate: 0.02 },
        { limit: 10800, rate: 0.03 },
        { limit: 13400, rate: 0.04 },
        { limit: 17100, rate: 0.053 },
        { limit: 19700, rate: 0.063 },
        { limit: 23800, rate: 0.073 },
        { limit: 27700, rate: 0.083 },
        { limit: Infinity, rate: 0.093 }
      ],
      'married-joint': [
        { limit: 4400, rate: 0.01 },
        { limit: 10600, rate: 0.02 },
        { limit: 14400, rate: 0.03 },
        { limit: 17800, rate: 0.04 },
        { limit: 22800, rate: 0.053 },
        { limit: 26200, rate: 0.063 },
        { limit: 31800, rate: 0.073 },
        { limit: 36900, rate: 0.083 },
        { limit: Infinity, rate: 0.093 }
      ]
    }
  },
  NE: {
    name: 'Nebraska',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3340, rate: 0.0254 },
        { limit: 8380, rate: 0.0324 },
        { limit: 13650, rate: 0.0406 },
        { limit: 27260, rate: 0.0459 },
        { limit: Infinity, rate: 0.0684 }
      ],
      'married-joint': [
        { limit: 6680, rate: 0.0254 },
        { limit: 16760, rate: 0.0324 },
        { limit: 27300, rate: 0.0406 },
        { limit: 54520, rate: 0.0459 },
        { limit: Infinity, rate: 0.0684 }
      ]
    }
  },
  NV: { name: 'Nevada', hasBrackets: false, flatRate: 0.00 },
  NH: { name: 'New Hampshire', hasBrackets: false, flatRate: 0.00 },
  NJ: {
    name: 'New Jersey',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 20000, rate: 0.0135 },
        { limit: 35000, rate: 0.0175 },
        { limit: 40000, rate: 0.0245 },
        { limit: 75000, rate: 0.0352 },
        { limit: 110000, rate: 0.0637 },
        { limit: 250000, rate: 0.0897 },
        { limit: Infinity, rate: 0.1037 }
      ],
      'married-joint': [
        { limit: 20000, rate: 0.0135 },
        { limit: 50000, rate: 0.0175 },
        { limit: 70000, rate: 0.0245 },
        { limit: 130000, rate: 0.0352 },
        { limit: 180000, rate: 0.0637 },
        { limit: 400000, rate: 0.0897 },
        { limit: Infinity, rate: 0.1037 }
      ]
    }
  },
  NM: {
    name: 'New Mexico',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 5900, rate: 0.017 },
        { limit: 11900, rate: 0.032 },
        { limit: 17100, rate: 0.047 },
        { limit: Infinity, rate: 0.059 }
      ],
      'married-joint': [
        { limit: 9400, rate: 0.017 },
        { limit: 18900, rate: 0.032 },
        { limit: 27200, rate: 0.047 },
        { limit: Infinity, rate: 0.059 }
      ]
    }
  },
  NY: {
    name: 'New York',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 8500, rate: 0.04 },
        { limit: 20000, rate: 0.0465 },
        { limit: 35000, rate: 0.055 },
        { limit: 40500, rate: 0.06 },
        { limit: 80750, rate: 0.0685 },
        { limit: 215400, rate: 0.0965 },
        { limit: 1077550, rate: 0.103 },
        { limit: Infinity, rate: 0.1085 }
      ],
      'married-joint': [
        { limit: 17000, rate: 0.04 },
        { limit: 40000, rate: 0.0465 },
        { limit: 70000, rate: 0.055 },
        { limit: 81000, rate: 0.06 },
        { limit: 161500, rate: 0.0685 },
        { limit: 430800, rate: 0.0965 },
        { limit: 2155350, rate: 0.103 },
        { limit: Infinity, rate: 0.1085 }
      ]
    }
  },
  NC: {
    name: 'North Carolina',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 25250, rate: 0.04 },
        { limit: 58200, rate: 0.06 },
        { limit: Infinity, rate: 0.085 }
      ],
      'married-joint': [
        { limit: 50500, rate: 0.04 },
        { limit: 116400, rate: 0.06 },
        { limit: Infinity, rate: 0.085 }
      ]
    }
  },
  ND: {
    name: 'North Dakota',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 40125, rate: 0.01 },
        { limit: 98405, rate: 0.02 },
        { limit: 189300, rate: 0.026 },
        { limit: Infinity, rate: 0.029 }
      ],
      'married-joint': [
        { limit: 66850, rate: 0.01 },
        { limit: 151200, rate: 0.02 },
        { limit: 230250, rate: 0.026 },
        { limit: Infinity, rate: 0.029 }
      ]
    }
  },
  OH: {
    name: 'Ohio',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 25550, rate: 0.015 },
        { limit: 51150, rate: 0.03 },
        { limit: 102850, rate: 0.04 },
        { limit: Infinity, rate: 0.0465 }
      ],
      'married-joint': [
        { limit: 42750, rate: 0.015 },
        { limit: 85550, rate: 0.03 },
        { limit: 171100, rate: 0.04 },
        { limit: Infinity, rate: 0.0465 }
      ]
    }
  },
  OK: {
    name: 'Oklahoma',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 1000, rate: 0.01 },
        { limit: 2500, rate: 0.02 },
        { limit: 3750, rate: 0.03 },
        { limit: 5000, rate: 0.04 },
        { limit: 7200, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ],
      'married-joint': [
        { limit: 2000, rate: 0.01 },
        { limit: 5000, rate: 0.02 },
        { limit: 7500, rate: 0.03 },
        { limit: 10000, rate: 0.04 },
        { limit: 14400, rate: 0.05 },
        { limit: Infinity, rate: 0.0575 }
      ]
    }
  },
  OR: {
    name: 'Oregon',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3750, rate: 0.0475 },
        { limit: 9450, rate: 0.0675 },
        { limit: 12000, rate: 0.0875 },
        { limit: Infinity, rate: 0.099 }
      ],
      'married-joint': [
        { limit: 7500, rate: 0.0475 },
        { limit: 18900, rate: 0.0675 },
        { limit: 24000, rate: 0.0875 },
        { limit: Infinity, rate: 0.099 }
      ]
    }
  },
  PA: {
    name: 'Pennsylvania',
    hasBrackets: false,
    flatRate: 0.0307
  },
  RI: {
    name: 'Rhode Island',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 73600, rate: 0.0375 },
        { limit: 168600, rate: 0.045 },
        { limit: Infinity, rate: 0.0475 }
      ],
      'married-joint': [
        { limit: 147200, rate: 0.0375 },
        { limit: 337200, rate: 0.045 },
        { limit: Infinity, rate: 0.0475 }
      ]
    }
  },
  SC: {
    name: 'South Carolina',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3650, rate: 0.03 },
        { limit: 7300, rate: 0.04 },
        { limit: 10950, rate: 0.05 },
        { limit: 14600, rate: 0.06 },
        { limit: Infinity, rate: 0.07 }
      ],
      'married-joint': [
        { limit: 5800, rate: 0.03 },
        { limit: 11600, rate: 0.04 },
        { limit: 17400, rate: 0.05 },
        { limit: 23200, rate: 0.06 },
        { limit: Infinity, rate: 0.07 }
      ]
    }
  },
  SD: { name: 'South Dakota', hasBrackets: false, flatRate: 0.00 },
  TN: { name: 'Tennessee', hasBrackets: false, flatRate: 0.00 },
  TX: { name: 'Texas', hasBrackets: false, flatRate: 0.00 },
  UT: {
    name: 'Utah',
    hasBrackets: false,
    flatRate: 0.0487
  },
  VT: {
    name: 'Vermont',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 45650, rate: 0.035 },
        { limit: 110200, rate: 0.063 },
        { limit: 210809, rate: 0.075 },
        { limit: Infinity, rate: 0.077 }
      ],
      'married-joint': [
        { limit: 61150, rate: 0.035 },
        { limit: 156600, rate: 0.063 },
        { limit: 238150, rate: 0.075 },
        { limit: Infinity, rate: 0.077 }
      ]
    }
  },
  VA: {
    name: 'Virginia',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 3000, rate: 0.02 },
        { limit: 12000, rate: 0.03 },
        { limit: 17000, rate: 0.05 },
        { limit: 70000, rate: 0.0575 },
        { limit: Infinity, rate: 0.0675 }
      ],
      'married-joint': [
        { limit: 6000, rate: 0.02 },
        { limit: 24000, rate: 0.03 },
        { limit: 34000, rate: 0.05 },
        { limit: 140000, rate: 0.0575 },
        { limit: Infinity, rate: 0.0675 }
      ]
    }
  },
  WA: { name: 'Washington', hasBrackets: false, flatRate: 0.00 },
  WV: {
    name: 'West Virginia',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 10000, rate: 0.03 },
        { limit: 25000, rate: 0.04 },
        { limit: 40000, rate: 0.045 },
        { limit: 60000, rate: 0.06 },
        { limit: Infinity, rate: 0.065 }
      ],
      'married-joint': [
        { limit: 20000, rate: 0.03 },
        { limit: 50000, rate: 0.04 },
        { limit: 80000, rate: 0.045 },
        { limit: 120000, rate: 0.06 },
        { limit: Infinity, rate: 0.065 }
      ]
    }
  },
  WI: {
    name: 'Wisconsin',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 15522, rate: 0.0355 },
        { limit: 38344, rate: 0.0465 },
        { limit: 245625, rate: 0.053 },
        { limit: Infinity, rate: 0.0585 }
      ],
      'married-joint': [
        { limit: 20769, rate: 0.0355 },
        { limit: 51216, rate: 0.0465 },
        { limit: 284500, rate: 0.053 },
        { limit: Infinity, rate: 0.0585 }
      ]
    }
  },
  WY: { name: 'Wyoming', hasBrackets: false, flatRate: 0.00 },
  DC: {
    name: 'District of Columbia',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 11075, rate: 0.04 },
        { limit: 31675, rate: 0.06 },
        { limit: 56000, rate: 0.085 },
        { limit: Infinity, rate: 0.0995 }
      ],
      'married-joint': [
        { limit: 15000, rate: 0.04 },
        { limit: 38000, rate: 0.06 },
        { limit: 60000, rate: 0.085 },
        { limit: Infinity, rate: 0.0995 }
      ]
    }
  }
};

/**
 * List of all states + DC for UI dropdowns
 */
export const stateList = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];
