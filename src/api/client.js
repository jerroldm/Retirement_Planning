const API_BASE_URL = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('authToken');

const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  return response.json();
};

export const authAPI = {
  signup: (email, password, firstName, lastName) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () =>
    apiCall('/auth/me', { method: 'GET' }),
};

export const financialAPI = {
  getFinancialData: () =>
    apiCall('/financial', { method: 'GET' }),

  saveFinancialData: (data) =>
    apiCall('/financial', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getScenarios: () =>
    apiCall('/financial/scenarios', { method: 'GET' }),

  saveScenario: (name, description, financialData) =>
    apiCall('/financial/scenarios', {
      method: 'POST',
      body: JSON.stringify({ name, description, financialData }),
    }),
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => getToken();
