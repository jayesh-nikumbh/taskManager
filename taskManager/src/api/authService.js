/**
 * Authentication Service
 * Handles all network requests related to user authentication and user management.
 */

const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Authenticates a user with the backend
 * @param {string} identifier - Email or Username
 * @param {string} password - User password
 * @param {AbortSignal} signal - Signal to abort the fetch request
 * @returns {Promise<Object>} API response data
 */
export const loginUser = async (identifier, password, signal) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
    signal,
  });
  return await res.json();
};

/**
 * Fetches the currently authenticated user's details
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} User details
 */
export const fetchMe = async (token) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

/**
 * Fetches all users registered in the system (Admin only)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} List of all users
 */
export const fetchAllUsers = async (token) => {
  const res = await fetch(`${API_BASE}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

/**
 * Registers a new user in the system
 * @param {Object} userData - User registration details (username, email, password, role)
 * @returns {Promise<Object>} Registration status and user data
 */
export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return await res.json();
};

/**
 * Deletes a user account (Admin only)
 * @param {string} id - User ID to delete
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Deletion status
 */
export const deleteUserApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/auth/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

/**
 * Updates a user account (Admin only)
 * @param {string} id - User ID to update
 * @param {Object} userData - Updated user details
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Update status
 */
export const updateUserApi = async (id, userData, token) => {
  const res = await fetch(`${API_BASE}/auth/users/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(userData),
  });
  return await res.json();
};

/**
 * Updates the currently authenticated user's profile
 * @param {Object} userData - Updated profile details
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Update status
 */
export const updateMeApi = async (userData, token) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(userData),
  });
  return await res.json();
};
