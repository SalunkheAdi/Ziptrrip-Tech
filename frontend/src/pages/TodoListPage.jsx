import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTodos, bulkDeleteTodos } from '../api/todos';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';
import EditTodoModal from '../components/EditTodoModal';
import '../styles/TodoListPage.css';

// ─── Toast Hook ────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'default') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, showToast };
}

// ─── Page 1: Todo List ─────────────────────────────────────────
function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const { toasts, showToast } = useToast();
  const searchTimeout = useRef(null);

  // ── Load todos from backend ──────────────────────────────────
  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTodos({ status: filterStatus, priority: filterPriority, search, sort, order });
      setTodos(res.data);
    } catch (err) {
      showToast('Failed to load todos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search, sort, order, showToast]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Debounce search input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 350);
  };

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    total: todos.length,
    pending: todos.filter((t) => t.status === 'pending').length,
    inProgress: todos.filter((t) => t.status === 'in-progress').length,
    completed: todos.filter((t) => t.status === 'completed').length,
  };

  // ── Selection ─────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === todos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(todos.map((t) => t.id));
    }
  };

  // ── Bulk delete ───────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} todo(s)?`)) return;
    try {
      await bulkDeleteTodos(selectedIds);
      showToast(`🗑️ ${selectedIds.length} todo(s) deleted`, 'success');
      setSelectedIds([]);
      loadTodos();
    } catch (err) {
      showToast('Bulk delete failed: ' + err.message, 'error');
    }
  };

  // ── CRUD callbacks ────────────────────────────────────────────
  const handleCreated = (newTodo) => {
    setTodos((prev) => [newTodo, ...prev]);
    setShowAddModal(false);
  };

  const handleUpdated = (updatedTodo) => {
    setTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
    setEditingTodo(null);
  };

  const handleDeleted = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleStatusChange = (updatedTodo) => {
    setTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
  };

  return (
    <div className="page-wrapper">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="list-header">
        <h1>
          <span className="header-logo">📋</span>
          ZipTrap Todos
        </h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ New Todo
        </button>
      </div>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* ── Toolbar: Search + Filters + Sort ──────────────── */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search todos…"
            onChange={handleSearchChange}
            aria-label="Search todos"
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="in-progress">🔄 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>

        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All Priority</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <div className="sort-label">
          Sort:
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ marginLeft: 4 }}
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
          </select>
          <select
            className="filter-select"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="DESC">↓ Desc</option>
            <option value="ASC">↑ Asc</option>
          </select>
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="bulk-bar">
          <span>{selectedIds.length} selected</span>
          <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll}>
            {selectedIds.length === todos.length ? 'Deselect All' : 'Select All'}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            🗑️ Delete Selected
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds([])}>
            ✕ Clear
          </button>
        </div>
      )}

      {/* ── Select All toggle (when no selection) ─────────── */}
      {todos.length > 0 && selectedIds.length === 0 && (
        <div style={{ marginBottom: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll}>
            ☐ Select All
          </button>
        </div>
      )}

      {/* ── Todo list ─────────────────────────────────────── */}
      {loading ? (
        <div className="spinner">Loading todos…</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📭</div>
          <h3>No todos found</h3>
          <p>
            {search || filterStatus || filterPriority
              ? 'Try clearing your filters.'
              : 'Click "New Todo" to get started!'}
          </p>
        </div>
      ) : (
        <div className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              selected={selectedIds.includes(todo.id)}
              onSelect={toggleSelect}
              onEdit={setEditingTodo}
              onDeleted={handleDeleted}
              onStatusChange={handleStatusChange}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      {showAddModal && (
        <AddTodoModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
          showToast={showToast}
        />
      )}

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdated={handleUpdated}
          showToast={showToast}
        />
      )}

      {/* ── Toast Notifications ───────────────────────────── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoListPage;
