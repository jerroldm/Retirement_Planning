// Tax Configuration API client
const API_BASE = '/api/tax-configuration';

export const taxConfigurationClient = {
  // Get tax configuration for current user
  async getConfiguration() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getConfiguration - Error response:', errorText);
      throw new Error(`Failed to fetch tax configuration: ${response.status}`);
    }
    return response.json();
  },

  // Save tax configuration (creates or updates)
  async saveConfiguration(configData) {
    const token = localStorage.getItem('authToken');

    // First try to update
    let response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(configData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('saveConfiguration - Error response:', errorText);
      throw new Error(`Failed to save tax configuration: ${response.status}`);
    }

    return response.json();
  },
};
