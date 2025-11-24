// Asset API client
const API_BASE = '/api/assets';

export const assetAPI = {
  // Get all assets for current user
  async getAssets() {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  // Get single asset
  async getAsset(id) {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return response.json();
  },

  // Update asset
  async updateAsset(id, assetData) {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  },
};
