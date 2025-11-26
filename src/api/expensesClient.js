// Expenses API client
const API_BASE = '/api/expenses';

export const expensesClient = {
  // Get all expenses for current user
  async getExpenses() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getExpenses - Error response:', errorText);
      throw new Error(`Failed to fetch expenses: ${response.status}`);
    }
    return response.json();
  },

  // Get single expense
  async getExpense(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch expense');
    return response.json();
  },

  // Create new expense
  async createExpense(expenseData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('createExpense - Error response:', errorText);
      throw new Error(`Failed to create expense: ${response.status}`);
    }
    return response.json();
  },

  // Update expense
  async updateExpense(id, expenseData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update expense: ${response.status}`);
    }
    return response.json();
  },

  // Delete expense
  async deleteExpense(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete expense');
    return response.json();
  },
};
