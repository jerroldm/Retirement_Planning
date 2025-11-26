// Income sources API client
const API_BASE = '/api/income';

export const incomeAPI = {
  // Get all income sources for current user
  async getSources() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getSources - Error response:', errorText);
      throw new Error(`Failed to fetch income sources: ${response.status}`);
    }
    return response.json();
  },

  // Get single income source
  async getSource(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch income source');
    return response.json();
  },

  // Create new income source
  async createSource(sourceData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sourceData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('createSource - Error response:', errorText);
      throw new Error(`Failed to create income source: ${response.status}`);
    }
    return response.json();
  },

  // Update income source
  async updateSource(id, sourceData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sourceData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update income source: ${response.status}`);
    }
    return response.json();
  },

  // Delete income source
  async deleteSource(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete income source');
    return response.json();
  },
};
