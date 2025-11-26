// Social Security API client
const API_BASE = '/api/social-security';

export const socialSecurityClient = {
  // Get all social security records for current user
  async getRecords() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getRecords - Error response:', errorText);
      throw new Error(`Failed to fetch social security records: ${response.status}`);
    }
    return response.json();
  },

  // Get single social security record
  async getRecord(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch social security record');
    return response.json();
  },

  // Create new social security record
  async createRecord(recordData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(recordData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('createRecord - Error response:', errorText);
      throw new Error(`Failed to create social security record: ${response.status}`);
    }
    return response.json();
  },

  // Update social security record
  async updateRecord(id, recordData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(recordData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update social security record: ${response.status}`);
    }
    return response.json();
  },

  // Delete social security record
  async deleteRecord(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete social security record');
    return response.json();
  },
};
