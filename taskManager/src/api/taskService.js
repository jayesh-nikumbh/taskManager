/**
 * Task Management Service
 * Handles all network requests for task CRUD operations.
 */

const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Retrieves tasks from the database, optionally filtered by user email
 * @param {string} [email] - Optional email to filter tasks
 * @returns {Promise<Object>} List of tasks
 */
export const fetchTasksApi = async (email) => {
  const url = email ? `${API_BASE}/tasks?email=${email}` : `${API_BASE}/tasks`;
  const res = await fetch(url);
  return await res.json();
};

/**
 * Creates a new task record
 * @param {Object} taskData - Task details (title, description, challenges, etc.)
 * @returns {Promise<Object>} Created task details
 */
export const createTaskApi = async (taskData) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return await res.json();
};

/**
 * Updates an existing task record
 * @param {string} id - Task ID to update
 * @param {Object} taskData - Updated task fields
 * @returns {Promise<Object>} Updated task details
 */
export const updateTaskApi = async (id, taskData) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return await res.json();
};

/**
 * Deletes a task record by ID
 * @param {string} id - Task ID to delete
 * @returns {Promise<Response>} Fetch response object
 */
export const deleteTaskApi = async (id) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  return res;
};
