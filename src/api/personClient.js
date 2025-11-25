const API_BASE = '/api/persons';

export const personClient = {
  // Get all persons for user
  async getPersons() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getPersons - Error response:', errorText);
      throw new Error(`Failed to fetch persons: ${response.status}`);
    }
    return response.json();
  },

  // Create a new person
  async createPerson(personData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(personData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('createPerson - Error response:', errorText);
      throw new Error(`Failed to create person: ${response.status}`);
    }
    return response.json();
  },

  // Update a person
  async updatePerson(personId, personData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${personId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(personData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('updatePerson - Error response:', errorText);
      throw new Error(`Failed to update person: ${response.status}`);
    }
    return response.json();
  },

  // Delete a person
  async deletePerson(personId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/${personId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('deletePerson - Error response:', errorText);
      throw new Error(`Failed to delete person: ${response.status}`);
    }
    return response.json();
  },
};
