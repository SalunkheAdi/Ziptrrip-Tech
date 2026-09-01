import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchTodoById, updateTodoStatus, deleteTodo } from '../api/todos';
import EditTodoModal from '../components/EditTodoModal';
import '../styles/TodoDetailPage.css';

// ─── Toast Hook (same as list page, could be moved to shared hook) ─
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

// ─── Helpers ──────────────────────────────────────────────────
function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function getDaysLeft(dateStr, status) {
  if (!dateStr || status === 'completed') return null;
  const diff = Math.ceil((new Date(dateStr) - new Date(new Date().toDateString())) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Due today';
  if (diff < 0) return `${Math.abs(diff)} day(s) overdue`;
  return `${diff} day(s) left`;
}

const STATUSES = ['pending', 'in-progress', 'completed'];

// ─────────────────────────────────────────────────────────────────
// Page 2: Single Todo Detail
// Receives ?id= query parameter from URL
// ─────────────────────────────────────────────────────────────────
function TodoDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const todoId = searchParams.get('id');

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const { toasts, showToast } = useToast();

  // ── Fetch single todo by ?id= ───────────────────────────────
  useEffect(() => {
    if (!todoId) {
      setError('No todo ID provided in the URL.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTodoById(todoId);
        setTodo(res.data);
      } catch (err) {
        setError(err.message || 'Todo not found.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [todoId]);

  // ── Status change ──────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateTodoStatus(todo.id, newStatus);
      setTodo(res.data);
      showToast(`Status updated to "${newStatus}"`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${todo.title}"? This cannot be undone.`)) return;
    try {
      await deleteTodo(todo.id);
      showToast('Todo deleted', 'success');
      setTimeout(() => navigate('/todos'), 1000);
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  // ── After edit ─────────────────────────────────────────────
  const handleUpdated = (updatedTodo) => {
    setTodo(updatedTodo);
    setShowEdit(false);
    showToast('✏️ Todo updated!', 'success');
  };

  // ── Render states ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner">Loading todo…</div>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="page-wrapper">
        <div className="error-state">
          <div className="emoji">😕</div>
          <h2>Todo Not Found</h2>
          <p>{error || `No todo with ID "${todoId}" exists.`}</p>
          <button className="btn btn-primary" onClick={() => navigate('/todos')}>
            ← Back to Todos
          </button>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(todo.due_date, todo.status);
  const daysLeft = getDaysLeft(todo.due_date, todo.status);
  const isCompleted = todo.status === 'completed';

  return (
    <div className="page-wrapper">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/todos')}>
          ← Back
        </button>
        <h1>Todo Details</h1>
      </div>

      {/* ── Main detail card ──────────────────────────────── */}
      <div className="detail-card">

        {/* Title */}
        <div className={`detail-title ${isCompleted ? 'completed' : ''}`}>
          {todo.title}
        </div>

        {/* Status + Priority badges */}
        <div className="detail-badges">
          <span className={`badge badge-${todo.status}`}>{todo.status}</span>
          <span className={`badge badge-${todo.priority}`}>{todo.priority} priority</span>
          {overdue && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>⚠️ Overdue</span>}
        </div>

        {/* ── Quick status switcher ──────────────────────── */}
        <div className="detail-section">
          <h3>Quick Status Change</h3>
          <div className="status-actions">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`status-chip ${todo.status === s ? 'active' : ''}`}
                onClick={() => todo.status !== s && handleStatusChange(s)}
                disabled={todo.status === s}
                title={`Set status to ${s}`}
              >
                {s === 'pending' ? '⏳' : s === 'in-progress' ? '🔄' : '✅'} {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Info Grid ─────────────────────────────────── */}
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <label>Todo ID</label>
            <div className="value">#{todo.id}</div>
          </div>

          <div className="detail-info-item">
            <label>Priority</label>
            <div className="value">
              {todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢'} {todo.priority}
            </div>
          </div>

          <div className="detail-info-item">
            <label>Due Date</label>
            <div className={`value ${overdue ? 'overdue' : ''}`}>
              {todo.due_date ? (
                <>📅 {formatDate(todo.due_date)}{daysLeft && <span style={{ fontSize: '0.8rem', display: 'block', marginTop: 2 }}>{daysLeft}</span>}</>
              ) : 'No due date'}
            </div>
          </div>

          <div className="detail-info-item">
            <label>Created At</label>
            <div className="value">🕐 {formatDateTime(todo.created_at)}</div>
          </div>

          <div className="detail-info-item">
            <label>Last Updated</label>
            <div className="value">✏️ {formatDateTime(todo.updated_at)}</div>
          </div>
        </div>

        {/* ── Description ───────────────────────────────── */}
        <div className="detail-section">
          <h3>Description</h3>
          {todo.description ? (
            <div className="detail-description">{todo.description}</div>
          ) : (
            <p className="detail-no-desc">No description provided.</p>
          )}
        </div>

        {/* ── Tags ──────────────────────────────────────── */}
        {Array.isArray(todo.tags) && todo.tags.length > 0 && (
          <div className="detail-section">
            <h3>Tags</h3>
            <div className="detail-tags">
              {todo.tags.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Timeline ──────────────────────────────────── */}
        <div className="detail-section">
          <h3>Activity Timeline</h3>
          <div className="detail-timeline">
            <div className="timeline-item">
              Todo created
              <time>{formatDateTime(todo.created_at)}</time>
            </div>
            {todo.updated_at !== todo.created_at && (
              <div className="timeline-item">
                Last modified
                <time>{formatDateTime(todo.updated_at)}</time>
              </div>
            )}
            {isCompleted && (
              <div className="timeline-item">
                ✅ Marked as completed
                <time>{formatDateTime(todo.updated_at)}</time>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
            ✏️ Edit Todo
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Delete Todo
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/todos')}>
            ← Back to List
          </button>
        </div>
      </div>

      {/* ── Edit Modal ────────────────────────────────────── */}
      {showEdit && (
        <EditTodoModal
          todo={todo}
          onClose={() => setShowEdit(false)}
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

export default TodoDetailPage;
