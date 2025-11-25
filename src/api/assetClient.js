// Asset API client
const API_BASE = '/api/assets';

export const assetAPI = {
  // Get all assets for current user
  async getAssets() {
    const token = localStorage.getItem('authToken');
    console.log('getAssets - Token exists:', !!token);
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('getAssets - Response status:', response.status, 'ok:', response.ok);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getAssets - Error response:', errorText);
      throw new Error(`Failed to fetch assets: ${response.status}`);
    }
    return response.json();
  },

  // Get single asset
  async getAsset(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch asset');
    return response.json();
  },

  // Create new asset
  async createAsset(assetData) {
    const token = localStorage.getItem('authToken');
    console.log('createAsset - Token exists:', !!token);
    console.log('createAsset - Data:', assetData);
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    });
    console.log('createAsset - Response status:', response.status, 'ok:', response.ok);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('createAsset - Error response:', errorText);
      throw new Error(`Failed to create asset: ${response.status}`);
    }
    return response.json();
  },

  // Update asset
  async updateAsset(id, assetData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  // Delete asset
  async deleteAsset(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  },

  // Migrate home data from financial_data to assets table
  async migrateHomeData() {
    const token = localStorage.getItem('authToken');
    console.log('migrateHomeData - Token exists:', !!token);
    const response = await fetch(`${API_BASE}/migrate/home-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('migrateHomeData - Response status:', response.status, 'ok:', response.ok);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('migrateHomeData - Error response:', errorText);
      throw new Error(`Failed to migrate home data: ${response.status}`);
    }
    return response.json();
  },

  // Migrate person ownership - assign unassigned assets/accounts to 'Self' person
  async migratePersonOwnership() {
    const token = localStorage.getItem('authToken');
    console.log('migratePersonOwnership - Token exists:', !!token);
    const response = await fetch(`${API_BASE}/migrate/assign-person-ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('migratePersonOwnership - Response status:', response.status, 'ok:', response.ok);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('migratePersonOwnership - Error response:', errorText);
      // Don't throw - migration is optional on first load
      return null;
    }
    return response.json();
  },
};
