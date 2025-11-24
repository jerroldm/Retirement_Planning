const API_BASE = 'http://localhost:3001/api';

export const savingsAccountAPI = {
  async getAccounts() {
    const response = await fetch(`${API_BASE}/savings-accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch savings accounts');
    return response.json();
  },

  async createAccount(accountData) {
    const response = await fetch(`${API_BASE}/savings-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(accountData)
    });
    if (!response.ok) throw new Error('Failed to create account');
    return response.json();
  },

  async updateAccount(accountId, accountData) {
    const response = await fetch(`${API_BASE}/savings-accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(accountData)
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  },

  async deleteAccount(accountId) {
    const response = await fetch(`${API_BASE}/savings-accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  }
};
