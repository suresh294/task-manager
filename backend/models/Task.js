const pool = require('../config/db');


class Task {
  // Get all tasks
  static async getAllTasks() {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get task by ID
  static async getTaskById(id) {
    const query = 'SELECT * FROM tasks WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Create a new task
  static async createTask(title, description = '', status = 'pending') {
    const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [title, description, status]);
    return {
      id: result.insertId,
      title,
      description,
      status,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Update an existing task
  static async updateTask(id, updates) {
    // Build dynamic query based on provided fields
    const allowedFields = ['title', 'description', 'status'];
    const fieldsToUpdate = [];
    const values = [];

    for (const field of allowedFields) {
      if (field in updates && updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    // Add id to values array for WHERE clause
    values.push(id);

    const query = `UPDATE tasks SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return null; // Task not found
    }

    // Return updated task
    return this.getTaskById(id);
  }

  // Delete a task
  static async deleteTask(id) {
    const query = 'DELETE FROM tasks WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0; // True if row was deleted
  }

  // Get tasks by status
  static async getTasksByStatus(status) {
    const query = 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, [status]);
    return rows;
  }

  // Get task count by status
  static async getTaskStats() {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM tasks 
      GROUP BY status
    `;
    const [rows] = await pool.execute(query);
    
    const stats = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    for (const row of rows) {
      stats[row.status] = row.count;
    }

    return stats;
  }
}

module.exports = Task;
