# Task Management Application — Node.js, Express, MySQL

A small full-stack practice project for creating, viewing, updating, filtering, and deleting tasks through a REST API and a vanilla JavaScript interface.

> **Demo status:** A public deployment URL has not been verified. Run the backend and frontend locally using the instructions below.

---

## 🚀 Features

- Add new tasks with title, description, and status
- View all tasks in a clean dashboard
- Update task details and status
- Delete tasks
- Filter tasks by status (Pending, In Progress, Completed)
- Persistent data storage using MySQL
- Responsive UI for desktop and mobile
- RESTful API with error handling

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)

**Backend:**
- Node.js
- Express.js

**Database:**
- MySQL

---

## 📁 Project Structure

```
Taskmanagement/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18 or newer
- MySQL Server

### Backend Setup
1. Navigate to the `backend` directory:
	```bash
	cd backend
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Copy `.env.example` to `.env` and update with your MySQL credentials:
	```bash
	cp .env.example .env
	```
4. Create the MySQL database and table:
	```sql
	CREATE DATABASE task_management;
	USE task_management;
	CREATE TABLE tasks (
	  id INT AUTO_INCREMENT PRIMARY KEY,
	  title VARCHAR(255) NOT NULL,
	  description TEXT,
	  status VARCHAR(50) DEFAULT 'pending',
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
	);
	```
5. Start the backend server:
	```bash
	npm start
	```

### Frontend Setup
1. Open `frontend/index.html` in your browser.
2. Ensure the backend server is running at `http://localhost:5000` (or update API URL in `script.js` if needed).

---

## 📚 API Endpoints

### Task Endpoints
- `POST /api/tasks` — Create a new task
- `GET /api/tasks` — Get all tasks
- `GET /api/tasks/:id` — Get task by ID
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Example Request
```json
POST /api/tasks
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

---

## Current Scope

This is a learning project. The task API uses MySQL and parameterized queries; configure a local database before starting the backend. The backend route module registers the CRUD endpoints documented above. Automated test coverage and a verified public deployment are not currently documented.

## 💡 Usage Tips
- Use filters to quickly view tasks by status.
- Edit or delete tasks directly from the dashboard.
- All changes are instantly reflected in the UI.

---

## 🧑‍💻 Author & License

- **Author:** Sureshkumar
- **License:** MIT

---

## 📞 Support

For questions or issues, please open an issue or contact me.

