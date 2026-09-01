# ZipTrap — Todo Application

A full-stack Todo application built with **React** (frontend) and **Node.js + Express.js** (backend), storing data in **PostgreSQL**.

---

## 📁 Project Structure

```
ziptrap/
├── backend/           # Node.js + Express.js API
│   ├── db/
│   │   ├── db.js      # PostgreSQL connection pool
│   │   └── schema.sql # Database schema
│   ├── routes/
│   │   └── todos.js   # All CRUD API routes
│   ├── server.js      # Express app entry point
│   ├── .env.example   # Environment variable template
│   └── package.json
├── frontend/          # React app (multi-page)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── todos.js         # API helper functions
│   │   ├── components/
│   │   │   ├── TodoItem.jsx     # Individual todo card
│   │   │   ├── AddTodoModal.jsx # Create todo modal
│   │   │   └── EditTodoModal.jsx# Edit todo modal
│   │   ├── pages/
│   │   │   ├── TodoListPage.jsx   # Page 1: List all todos
│   │   │   ├── TodoDetailPage.jsx # Page 2: Single todo detail
│   │   │   └── NotFoundPage.jsx   # 404 page
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── TodoListPage.css
│   │   │   └── TodoDetailPage.css
│   │   ├── App.jsx    # React Router setup (multi-page)
│   │   └── index.js
│   └── package.json
├── docs/
│   └── FEATURES.md    # Feature documentation
└── README.md          # This file
```

---

## ⚙️ Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React 18, React Router v6 |
| Backend    | Node.js, Express.js       |
| Database   | PostgreSQL                |
| DB Client  | `pg` (node-postgres)      |
| Styling    | Plain CSS (CSS variables) |
| Language   | JavaScript (ES6+)         |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ziptrap
```

---

### 2. Set Up the Database

Open **pgAdmin** or the **psql** CLI and run:

```sql
-- Create the database
CREATE DATABASE ziptrap_todos;

-- Connect to it
\c ziptrap_todos

-- Run the schema
\i backend/db/schema.sql
```

Or using psql from terminal:

```bash
psql -U postgres -c "CREATE DATABASE ziptrap_todos;"
psql -U postgres -d ziptrap_todos -f backend/db/schema.sql
```

---

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ziptrap_todos
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=5000
```

---

### 4. Install & Run Backend

```bash
cd backend
npm install
npm run dev      # Development (uses nodemon)
# or
npm start        # Production
```

Backend runs at: `http://localhost:5000`

---

### 5. Install & Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

> The React app proxies API calls to `http://localhost:5000` automatically (configured in `package.json`).

---

## 🌐 API Endpoints

| Method   | Endpoint                      | Description                    |
|----------|-------------------------------|--------------------------------|
| `GET`    | `/api/todos`                  | Get all todos (with filters)   |
| `GET`    | `/api/todos/:id`              | Get a single todo by ID        |
| `POST`   | `/api/todos`                  | Create a new todo              |
| `PUT`    | `/api/todos/:id`              | Update a todo                  |
| `PATCH`  | `/api/todos/:id/status`       | Quick status update            |
| `DELETE` | `/api/todos/:id`              | Delete a todo                  |
| `DELETE` | `/api/todos/bulk/delete`      | Bulk delete multiple todos     |
| `GET`    | `/api/health`                 | Health check                   |

See [docs/FEATURES.md](docs/FEATURES.md) for full feature documentation.

---

## 📋 Pages

### Page 1 — `/todos`
The main todo list page with all management features.

### Page 2 — `/todo?id=<id>`
Single todo detail page. Receives the todo ID as a query parameter.

---

## 📄 Documentation

Full feature documentation is available in [`docs/FEATURES.md`](docs/FEATURES.md).

---

## ☁️ Deployment

To deploy the app online (free), see the full guide: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [vercel.com](https://vercel.com) |
| Backend  | Render  | [render.com](https://render.com) |
| Database | Neon    | [neon.tech](https://neon.tech) |
