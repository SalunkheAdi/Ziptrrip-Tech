# ZipTrap — Features & Functionalities

This document describes all implemented features of the ZipTrap Todo Application.

---

## 📋 Page 1 — Todo List (`/todos`)

### ✅ Core CRUD
| Feature | Description |
|---------|-------------|
| **Create Todo** | Click "New Todo" to open a modal and add a new todo with title, description, priority, status, due date, and tags |
| **View Todos** | All todos are displayed as cards on the list page |
| **Edit Todo** | Click the ✏️ button on any card to open the edit modal and update any field |
| **Delete Todo** | Click 🗑️ on any card to delete it (with confirmation prompt) |
| **Toggle Complete** | Click ✅ on a card to instantly mark it as completed, or ↩️ to revert to pending |

### 🔍 Search & Filtering
| Feature | Description |
|---------|-------------|
| **Live Search** | Search bar filters todos by title or description in real-time (debounced 350ms) |
| **Filter by Status** | Dropdown to filter by: All / Pending / In Progress / Completed |
| **Filter by Priority** | Dropdown to filter by: All / Low / Medium / High |
| **Sort** | Sort todos by: Created Date / Due Date / Title / Priority |
| **Sort Order** | Toggle between Ascending and Descending order |

### 📊 Stats Bar
| Stat | Description |
|------|-------------|
| **Total** | Count of all todos currently shown |
| **Pending** | Count of pending todos |
| **In Progress** | Count of in-progress todos |
| **Completed** | Count of completed todos |

### ☐ Bulk Operations
| Feature | Description |
|---------|-------------|
| **Select Individual** | Each todo card has a checkbox for selection |
| **Select All** | "Select All" button to select all visible todos at once |
| **Bulk Delete** | Delete all selected todos in one click (with confirmation) |
| **Clear Selection** | Deselect all with the "✕ Clear" button |

### 🃏 Todo Card Display
Each card shows:
- Title (with strikethrough if completed)
- Status badge (color-coded)
- Priority badge (color-coded)
- Due date with **overdue warning** (red ⚠️) if past due
- Tags displayed as chips (shows first 3, with `+N` overflow indicator)
- Quick action buttons: Toggle, Edit, Delete
- **Click anywhere on the card** to navigate to the detail page

---

## 📄 Page 2 — Todo Detail (`/todo?id=<id>`)

This page receives the todo ID as a **query parameter** (`?id=`) and displays all associated information.

### 📝 Information Displayed
| Field | Description |
|-------|-------------|
| **Title** | Full title (strikethrough if completed) |
| **Status Badge** | Color-coded status indicator |
| **Priority Badge** | Color-coded priority indicator |
| **Overdue Badge** | Shown in red if past due and not completed |
| **Todo ID** | Unique database ID |
| **Due Date** | Full date + remaining days / overdue days |
| **Created At** | Exact creation timestamp |
| **Last Updated** | Last modification timestamp |
| **Description** | Full description with whitespace preserved |
| **Tags** | All tags shown as chips |

### ⚡ Quick Status Change
Three clickable status buttons (Pending / In Progress / Completed) that immediately update the status via API without opening a modal.

### 🕐 Activity Timeline
A vertical timeline showing:
- When the todo was created
- When it was last modified (if different from creation)
- When it was marked as completed

### 🔧 Actions
| Action | Description |
|--------|-------------|
| **Edit** | Opens edit modal to modify all fields |
| **Delete** | Deletes the todo with confirmation and redirects to list |
| **Back to List** | Navigates back to `/todos` |

---

## 🎨 UI / UX Features

| Feature | Description |
|---------|-------------|
| **Toast Notifications** | Non-intrusive bottom-right toast for all actions (success/error) with auto-dismiss |
| **Loading Spinner** | Shown while fetching data |
| **Empty State** | Friendly message when no todos match the filters |
| **Error State** | Clear error message on detail page if ID is invalid |
| **Modal Overlay** | Click outside the modal to close it |
| **Responsive Design** | Works on mobile and desktop screens |
| **Keyboard Accessibility** | Forms support Enter to submit, proper labels |

---

## 🗄️ Backend API Features

### Todo Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Auto-generated unique ID |
| `title` | String | Required. Todo title (max 255 chars) |
| `description` | Text | Optional. Detailed description |
| `priority` | Enum | `low` / `medium` / `high` (default: `medium`) |
| `status` | Enum | `pending` / `in-progress` / `completed` (default: `pending`) |
| `due_date` | Date | Optional due date |
| `tags` | String[] | Array of tag strings |
| `created_at` | Timestamp | Auto-set on creation |
| `updated_at` | Timestamp | Auto-updated on any change (DB trigger) |

### Query Parameters (GET /api/todos)
| Param | Example | Description |
|-------|---------|-------------|
| `status` | `?status=pending` | Filter by status |
| `priority` | `?priority=high` | Filter by priority |
| `search` | `?search=meeting` | Search title and description (case-insensitive) |
| `sort` | `?sort=due_date` | Sort column |
| `order` | `?order=ASC` | Sort direction |

### Error Handling
- All routes return `{ success: false, message: "..." }` on error
- Proper HTTP status codes: `200`, `201`, `400`, `404`, `500`
- Input validation on `title` (required), `status`, and `priority` (enum check)
- SQL injection prevention via parameterized queries

---

## 🔐 Security & Best Practices

| Practice | Implementation |
|----------|---------------|
| **Parameterized Queries** | All DB queries use `$1, $2` placeholders to prevent SQL injection |
| **Sort Column Whitelist** | Only allowed column names are used in ORDER BY |
| **CORS Configuration** | Restricted to frontend origin only |
| **Input Validation** | Server-side validation on required fields and enum values |
| **Environment Variables** | Database credentials stored in `.env`, never hardcoded |
