const API_BASE = 'http://localhost:3001/api';

export const savingsAccountAPI = {
  async getAccounts() {
    const response = await fetch(`${API_BASE}/savings-accounts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(accountData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Failed to create account');
    }
    return response.json();
  },

  async updateAccount(accountId, accountData) {
    console.log('savingsAccountClient.updateAccount called with ID:', accountId);
    console.log('Request body:', accountData);
    console.log('Auth token present:', !!localStorage.getItem('authToken'));

    const response = await fetch(`${API_BASE}/savings-accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(accountData)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update failed with status', response.status, ':', errorText);
      throw new Error('Failed to update account');
    }

    const result = await response.json();
    console.log('Update result:', result);
    return result;
  },

  async deleteAccount(accountId) {
    const response = await fetch(`${API_BASE}/savings-accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  }
};
