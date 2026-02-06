// authService.ts - Authentication service for handling API calls and JWT management

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Login function
export const login = async (email: string, password: string): Promise<{ token: string; user: any } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const register = async (username: string, email: string, password: string): Promise<{ token: string; user: any } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  // Remove token from localStorage
  localStorage.removeItem('token');
};

// Get current user based on token
export const getCurrentUser = async (): Promise<any | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      // If token is invalid/expired, remove it
      localStorage.removeItem('token');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    localStorage.removeItem('token'); // Remove token if there's an error
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in header for API requests
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};