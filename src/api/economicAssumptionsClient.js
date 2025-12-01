// Economic Assumptions API client
const API_BASE = '/api/economic-assumptions';

export const economicAssumptionsClient = {
  // Get economic assumptions for current user
  async getAssumptions() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAssumptions - Error response:', errorText);
      throw new Error(`Failed to fetch economic assumptions: ${response.status}`);
    }
    return response.json();
  },

  // Save economic assumptions (creates or updates)
  async saveAssumptions(assumptionsData) {
    const token = localStorage.getItem('authToken');

    // First try to update
    let response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assumptionsData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('saveAssumptions - Error response:', errorText);
      throw new Error(`Failed to save economic assumptions: ${response.status}`);
    }

    return response.json();
  },
};
