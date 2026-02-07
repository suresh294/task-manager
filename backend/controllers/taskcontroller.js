const Task = require('../models/Task');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Validation: title is required
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Title is required'
      });
    }

    // Validation: title length (max 255 characters)
    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Title must not exceed 255 characters'
      });
    }

    // Validation: status must be valid enum value
    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Status must be one of: pending, in-progress, completed'
      });
    }

    // Create task in database
    const task = await Task.createTask(title, description || '', status || 'pending');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    // If status filter provided, validate and use it
    let tasks;
    if (status) {
      if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
          error: 'Status must be one of: pending, in-progress, completed'
        });
      }
      tasks = await Task.getTasksByStatus(status);
    } else {
      // Get all tasks
      tasks = await Task.getAllTasks();
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Fetch a specific task by ID
 * 
 * URL Parameters:
 *   id: Task ID (must be a number)
 * 
 * Response:
 *   {
 *     "success": true,
 *     "task": {...}
 *   }
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation: id must be a positive integer
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Task ID must be a positive integer'
      });
    }

    // Fetch task
    const task = await Task.getTaskById(id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        error: `No task with ID ${id}`
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * 
 * URL Parameters:
 *   id: Task ID
 * 
 * Request Body (all optional):
 *   {
 *     "title": "New title",
 *     "description": "New description",
 *     "status": "in-progress"
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "message": "Task updated successfully",
 *     "task": {...}
 *   }
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation: id must be a positive integer
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Task ID must be a positive integer'
      });
    }

    // Validation: at least one field must be provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'At least one field (title, description, status) must be provided'
      });
    }

    // Validation: title length if provided
    if (updates.title && updates.title.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Title must not exceed 255 characters'
      });
    }

    // Validation: status must be valid enum value if provided
    if (updates.status && !['pending', 'in-progress', 'completed'].includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Status must be one of: pending, in-progress, completed'
      });
    }

    // Update task
    const updatedTask = await Task.updateTask(id, updates);

    // Check if task exists
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        error: `No task with ID ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * 
 * URL Parameters:
 *   id: Task ID
 * 
 * Response:
 *   {
 *     "success": true,
 *     "message": "Task deleted successfully"
 *   }
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation: id must be a positive integer
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Task ID must be a positive integer'
      });
    }

    // Delete task
    const deleted = await Task.deleteTask(id);

    // Check if task was deleted
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        error: `No task with ID ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
