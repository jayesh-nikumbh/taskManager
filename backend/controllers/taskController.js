const Task = require('../models/Task');

/**
 * ✅ GET /api/tasks
 * Description: Retrieves all tasks, sorted by most recent first
 */
const getAllTasks = async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { userEmail: email } : {};
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks', error: err.message });
  }
};

/**
 * ✅ GET /api/tasks/:id
 * Description: Retrieves a single task record by its ID
 */
const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task record not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving task details', error: err.message });
  }
};

/**
 * ✅ POST /api/tasks
 * Description: Creates a new task or activity log entry
 */
const createTask = async (req, res) => {
  const { title, description, challenge, userName, userEmail, date } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const task = await Task.create({
      title,
      description: description || '',
      challenge: challenge || req.body.challenges || '',
      userName: userName || 'Unknown User',
      userEmail: userEmail || 'unknown@example.com',
      date: date || new Date(),
      ipAddress,
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task record', error: err.message });
  }
};

/**
 * ✅ PUT /api/tasks/:id
 * Description: Updates an existing task record
 */
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, challenge, challenges, date } = req.body;
  
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        challenge: challenge || challenges || '', 
        date
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task record not found for update' });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task record', error: err.message });
  }
};

/**
 * ✅ DELETE /api/tasks/:id
 * Description: Deletes a task record from the system
 */
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task record not found for deletion' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully', task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task record', error: err.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
