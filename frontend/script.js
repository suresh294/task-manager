/**
 * Task Management App - Frontend JavaScript
 * 
 * This file handles all frontend logic for the Task Management application.
 * It connects to the backend REST API and manages the user interface.
 * 
 * Key Responsibilities:
 * - Manage API communication (fetch requests)
 * - Handle form submissions
 * - Render and update task list dynamically
 * - Handle filtering and status updates
 * - Manage statistics display
 * - Error handling and user feedback
 */

// ============================================
// API CONFIGURATION
// ============================================
/**
 * API Base URL - Update this if backend runs on different host/port
 * Default: http://localhost:5000
 * Production: https://api.yourdomain.com
 */
const API_BASE_URL = 'http://localhost:5000/api';
const TASKS_ENDPOINT = `${API_BASE_URL}/tasks`;

/**
 * Represents different task statuses
 * Used for filtering and validation
 */
const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================
/**
 * Cache DOM elements for better performance
 * (Avoids querying DOM repeatedly)
 */
const dom = {
  // Form elements
  taskForm: document.getElementById('taskForm'),
  taskTitle: document.getElementById('taskTitle'),
  taskDescription: document.getElementById('taskDescription'),
  taskStatus: document.getElementById('taskStatus'),
  titleError: document.getElementById('titleError'),
  descriptionError: document.getElementById('descriptionError'),

  // Task list elements
  taskList: document.getElementById('taskList'),
  taskTemplate: document.getElementById('taskTemplate'),

  // Filter buttons
  filterButtons: document.querySelectorAll('.filter-btn'),

  // Statistics elements
  statTotal: document.getElementById('statTotal'),
  statPending: document.getElementById('statPending'),
  statInProgress: document.getElementById('statInProgress'),
  statCompleted: document.getElementById('statCompleted')
};

// ============================================
// APPLICATION STATE
// ============================================
/**
 * Global application state
 * Keeps track of current data and UI state
 */
const appState = {
  tasks: [],                    // All tasks from server
  currentFilter: 'all',         // Active filter: 'all', 'pending', 'in-progress', 'completed'
  isLoading: false,             // API request in progress
  error: null                   // Current error message
};

// ============================================
// INITIALIZATION
// ============================================
/**
 * Initialize the application when DOM is ready
 * Loads tasks from server and sets up event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initializing...');

  // Set up event listeners
  setupEventListeners();

  // Load initial tasks from server
  loadTasks();

  console.log('Application ready');
});

// ============================================
// EVENT LISTENERS SETUP
// ============================================
/**
 * Configure all event listeners for user interactions
 */
function setupEventListeners() {
  // Form submission
  dom.taskForm.addEventListener('submit', handleFormSubmit);

  // Filter buttons
  dom.filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      handleFilterClick(e.target.dataset.filter);
    });
  });

  // Clear form errors when user starts typing
  dom.taskTitle.addEventListener('focus', () => clearError('title'));
  dom.taskDescription.addEventListener('focus', () => clearError('description'));
}

// ============================================
// API COMMUNICATION FUNCTIONS
// ============================================
/**
 * GET /api/tasks
 * Fetch all tasks from the server
 * 
 * @returns {Promise<Array>} Array of task objects
 * @throws {Error} If API request fails
 */
async function fetchAllTasks() {
  try {
    const response = await fetch(TASKS_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    showError('Failed to load tasks. Please refresh the page.');
    throw error;
  }
}

/**
 * POST /api/tasks
 * Create a new task on the server
 * 
 * @param {Object} taskData - Task data to create
 * @param {string} taskData.title - Task title (required)
 * @param {string} taskData.description - Task description (optional)
 * @param {string} taskData.status - Task status (optional, default: 'pending')
 * 
 * @returns {Promise<Object>} Created task object with ID
 * @throws {Error} If validation fails or API request fails
 */
async function createTask(taskData) {
  try {
    // Validate title on frontend (basic validation)
    if (!taskData.title || taskData.title.trim() === '') {
      showFieldError('titleError', 'Title is required');
      return null;
    }

    if (taskData.title.length > 255) {
      showFieldError('titleError', 'Title must not exceed 255 characters');
      return null;
    }

    // Send POST request to server
    const response = await fetch(TASKS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: taskData.status || TASK_STATUSES.PENDING
      })
    });

    const data = await response.json();

    // Handle server response
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to create task');
    }

    return data.task;
  } catch (error) {
    console.error('Error creating task:', error);
    showError(error.message);
    return null;
  }
}

/**
 * PUT /api/tasks/:id
 * Update an existing task on the server
 * 
 * @param {number} taskId - Task ID to update
 * @param {Object} updates - Fields to update
 * @param {string} updates.title - New title (optional)
 * @param {string} updates.description - New description (optional)
 * @param {string} updates.status - New status (optional)
 * 
 * @returns {Promise<Object>} Updated task object
 * @throws {Error} If API request fails
 */
async function updateTask(taskId, updates) {
  try {
    const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to update task');
    }

    return data.task;
  } catch (error) {
    console.error('Error updating task:', error);
    showError(error.message);
    return null;
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task from the server
 * 
 * @param {number} taskId - Task ID to delete
 * 
 * @returns {Promise<boolean>} True if successfully deleted
 * @throws {Error} If API request fails
 */
async function deleteTask(taskId) {
  try {
    const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to delete task');
    }

    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    showError(error.message);
    return false;
  }
}

// ============================================
// FORM HANDLING
// ============================================
/**
 * Handle form submission for creating a new task
 * 
 * @param {Event} e - Form submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  // Set loading state
  appState.isLoading = true;

  try {
    // Gather form data
    const taskData = {
      title: dom.taskTitle.value,
      description: dom.taskDescription.value,
      status: dom.taskStatus.value
    };

    // Create task via API
    const newTask = await createTask(taskData);

    if (newTask) {
      // Add to local state
      appState.tasks.push(newTask);

      // Reset form
      dom.taskForm.reset();
      clearAllErrors();

      // Update UI
      renderTasks();
      updateStatistics();

      // Show success feedback
      console.log('Task created successfully:', newTask);
    }
  } catch (error) {
    console.error('Error in form submission:', error);
  } finally {
    appState.isLoading = false;
  }
}

/**
 * Validate and display form field errors
 * 
 * @param {string} fieldId - ID of error element
 * @param {string} message - Error message to display
 */
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(fieldId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

/**
 * Clear error message for a specific field
 * 
 * @param {string} fieldName - 'title' or 'description'
 */
function clearError(fieldName) {
  const errorId = fieldName === 'title' ? 'titleError' : 'descriptionError';
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

/**
 * Clear all form errors
 */
function clearAllErrors() {
  dom.titleError.textContent = '';
  dom.titleError.classList.remove('show');
  dom.descriptionError.textContent = '';
  dom.descriptionError.classList.remove('show');
}

// ============================================
// TASK LIST RENDERING
// ============================================
/**
 * Load all tasks from server and render them
 */
async function loadTasks() {
  appState.isLoading = true;

  try {
    appState.tasks = await fetchAllTasks();
    renderTasks();
    updateStatistics();
  } catch (error) {
    console.error('Failed to load tasks:', error);
  } finally {
    appState.isLoading = false;
  }
}

/**
 * Render task list based on current filter and state
 * 
 * Filter Logic:
 * - 'all': Show all tasks
 * - 'pending': Show only pending tasks
 * - 'in-progress': Show only in-progress tasks
 * - 'completed': Show only completed tasks
 */
function renderTasks() {
  // Clear existing task list
  dom.taskList.innerHTML = '';

  // Filter tasks based on current filter
  const filteredTasks = filterTasks(appState.tasks, appState.currentFilter);

  // Render empty state if no tasks
  if (filteredTasks.length === 0) {
    dom.taskList.innerHTML = `
      <div class="task-list__empty">
        <p class="task-list__empty-text">
          ${appState.currentFilter === 'all' 
            ? 'No tasks yet. Create one to get started!' 
            : `No ${appState.currentFilter} tasks`
          }
        </p>
      </div>
    `;
    return;
  }

  // Render each task
  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    dom.taskList.appendChild(taskElement);
  });
}

/**
 * Filter tasks array based on filter criteria
 * 
 * @param {Array<Object>} tasks - Array of task objects
 * @param {string} filter - Filter type: 'all', 'pending', 'in-progress', 'completed'
 * 
 * @returns {Array<Object>} Filtered tasks array
 */
function filterTasks(tasks, filter) {
  if (filter === 'all') {
    return tasks;
  }

  return tasks.filter(task => task.status === filter);
}

/**
 * Create a DOM element for a task card
 * Uses the task template and populates with data
 * 
 * @param {Object} task - Task object
 * 
 * @returns {HTMLElement} Cloned and populated task element
 */
function createTaskElement(task) {
  // Clone template
  const taskElement = dom.taskTemplate.content.cloneNode(true);

  // Get task card reference
  const taskCard = taskElement.querySelector('.task-card');
  taskCard.dataset.taskId = task.id;
  taskCard.dataset.status = task.status;

  // Populate title and status
  taskElement.querySelector('.task-card__title').textContent = task.title;
  
  // Set status badge
  const statusBadge = taskElement.querySelector('.task-card__status');
  statusBadge.textContent = capitalizeStatus(task.status);
  statusBadge.className = `task-card__status task-card__status--${task.status}`;

  // Populate description (if exists)
  const descElement = taskElement.querySelector('.task-card__description');
  if (task.description) {
    descElement.textContent = task.description;
  } else {
    descElement.style.display = 'none';
  }

  // Set created date
  const dateElement = taskElement.querySelector('.task-card__date');
  dateElement.textContent = formatDate(task.created_at);

  // Set status dropdown value
  const statusSelect = taskElement.querySelector('.task-card__status-select');
  statusSelect.value = task.status;

  // Set up event listeners for task actions
  setupTaskEventListeners(taskElement, task.id);

  return taskElement;
}

/**
 * Setup event listeners for individual task actions
 * - Edit button (for future inline editing)
 * - Delete button (delete task)
 * - Status dropdown (update task status)
 * 
 * @param {HTMLElement} taskElement - Task card DOM element
 * @param {number} taskId - Task ID
 */
function setupTaskEventListeners(taskElement, taskId) {
  // Edit button (placeholder for future functionality)
  const editBtn = taskElement.querySelector('.btn-icon--edit');
  editBtn.addEventListener('click', async () => {
    console.log('Edit task:', taskId);
    // Future: Implement inline editing
    // For now, just log the action
  });

  // Delete button
  const deleteBtn = taskElement.querySelector('.btn-icon--delete');
  deleteBtn.addEventListener('click', async () => {
    await handleDeleteTask(taskId);
  });

  // Status dropdown
  const statusSelect = taskElement.querySelector('.task-card__status-select');
  statusSelect.addEventListener('change', async (e) => {
    await handleStatusChange(taskId, e.target.value);
  });
}

/**
 * Handle task deletion
 * 
 * @param {number} taskId - Task ID to delete
 */
async function handleDeleteTask(taskId) {
  // Confirm deletion with user
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  // Delete via API
  const success = await deleteTask(taskId);

  if (success) {
    // Remove from local state
    appState.tasks = appState.tasks.filter(task => task.id !== taskId);

    // Update UI
    renderTasks();
    updateStatistics();

    console.log('Task deleted successfully:', taskId);
  }
}

/**
 * Handle task status change via dropdown
 * 
 * @param {number} taskId - Task ID
 * @param {string} newStatus - New status value
 */
async function handleStatusChange(taskId, newStatus) {
  // Update via API
  const updatedTask = await updateTask(taskId, { status: newStatus });

  if (updatedTask) {
    // Update local state
    const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      appState.tasks[taskIndex] = updatedTask;
    }

    // Update UI
    renderTasks();
    updateStatistics();

    console.log('Task status updated:', taskId, newStatus);
  }
}

// ============================================
// FILTERING
// ============================================
/**
 * Handle filter button click
 * Updates current filter and re-renders task list
 * 
 * @param {string} filterType - Filter type: 'all', 'pending', 'in-progress', 'completed'
 */
function handleFilterClick(filterType) {
  // Update current filter
  appState.currentFilter = filterType;

  // Update UI: Mark active filter button
  dom.filterButtons.forEach(button => {
    if (button.dataset.filter === filterType) {
      button.classList.add('filter-btn--active');
    } else {
      button.classList.remove('filter-btn--active');
    }
  });

  // Re-render task list with new filter
  renderTasks();

  console.log('Filter changed to:', filterType);
}

// ============================================
// STATISTICS
// ============================================
/**
 * Update statistics section with task counts
 * Calculates total, pending, in-progress, and completed task counts
 */
function updateStatistics() {
  // Calculate counts for each status
  const stats = {
    total: appState.tasks.length,
    pending: appState.tasks.filter(t => t.status === TASK_STATUSES.PENDING).length,
    'in-progress': appState.tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length,
    completed: appState.tasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length
  };

  // Update DOM
  dom.statTotal.textContent = stats.total;
  dom.statPending.textContent = stats.pending;
  dom.statInProgress.textContent = stats['in-progress'];
  dom.statCompleted.textContent = stats.completed;

  console.log('Statistics updated:', stats);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
/**
 * Format date string for display
 * Converts ISO date to readable format
 * 
 * @param {string} dateString - ISO date string (e.g., "2026-02-07T10:30:00.000Z")
 * 
 * @returns {string} Formatted date (e.g., "Feb 7, 2026 10:30 AM")
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Capitalize status string for display
 * Converts 'pending' to 'Pending', 'in-progress' to 'In Progress', etc.
 * 
 * @param {string} status - Status value
 * 
 * @returns {string} Capitalized and formatted status
 */
function capitalizeStatus(status) {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Show error message to user
 * Displays temporary error notification
 * 
 * @param {string} message - Error message to display
 */
function showError(message) {
  console.error('Error:', message);
  // In a real app, would show toast notification or alert
  // For now, just log to console and show alert
  alert('Error: ' + message);
}

// ============================================
// FRONTEND-BACKEND COMMUNICATION FLOW
// ============================================
/**
 * Communication Architecture:
 * 
 * FRONTEND (Client Browser)                    BACKEND (Node.js + Express)
 * ═════════════════════════════════           ═════════════════════════════════
 *
 * 1. USER CREATES TASK:
 *    User fills form → handleFormSubmit()
 *         ↓
 *    fetch(POST /api/tasks)  ──────────────→  POST /api/tasks
 *                                             Creates task in MySQL
 *                                             Returns task object with ID
 *         ←──────────────  Response { task }
 *    ← appState.tasks.push(task)
 *    ← renderTasks()
 *    ← updateStatistics()
 *
 * 2. USER LOADS PAGE:
 *    DOMContentLoaded
 *         ↓
 *    loadTasks() → fetch(GET /api/tasks)
 *         ↓                  ────────────────→  GET /api/tasks
 *         ↓                                     Queries MySQL for all tasks
 *         ↓                                     Returns tasks array
 *         ←──────────────  Response { tasks }
 *    appState.tasks = tasks
 *    renderTasks()
 *    updateStatistics()
 *
 * 3. USER UPDATES TASK STATUS:
 *    User clicks status dropdown → handleStatusChange()
 *         ↓
 *    fetch(PUT /api/tasks/:id)  ──────────────→  PUT /api/tasks/:id
 *                                              Updates task status in MySQL
 *                                              Returns updated task object
 *         ←──────────────  Response { task }
 *    ← Update appState.tasks
 *    ← renderTasks()
 *    ← updateStatistics()
 *
 * 4. USER DELETES TASK:
 *    User clicks delete button → handleDeleteTask()
 *         ↓
 *    fetch(DELETE /api/tasks/:id)  ─────────────→  DELETE /api/tasks/:id
 *                                                Deletes task from MySQL
 *                                                Returns success message
 *         ←──────────────  Response { success }
 *    ← Remove from appState.tasks
 *    ← renderTasks()
 *    ← updateStatistics()
 *
 * ERROR HANDLING:
 *    API Error ─→ catch(error) ─→ showError() ─→ Alert user
 *    Network Error handled gracefully
 *    Validation errors shown in form
 *
 * STATE MANAGEMENT:
 *    ├─ appState.tasks[] ─→ Single source of truth
 *    ├─ appState.currentFilter ─→ Active filter
 *    ├─ appState.isLoading ─→ API request state
 *    └─ appState.error ─→ Current error message
 *
 * DATA FLOW:
 *    User Action ─→ Event Handler ─→ API Call ─→ Update State ─→ Re-render UI
 */

console.log('Script loaded successfully');
