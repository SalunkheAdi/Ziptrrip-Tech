import React from 'react';
import { useNavigate } from 'react-router-dom';
import { updateTodoStatus, deleteTodo } from '../api/todos';

// Utility: format date or return fallback
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Utility: check if due date is past
function isOverdue(dateStr, status) {
  if (!dateStr || status === 'completed') return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

/**
 * TodoItem
 * A single todo card shown on the list page.
 * Props:
 *   todo         — todo data object
 *   selected     — whether checkbox is checked (for bulk ops)
 *   onSelect     — checkbox toggle callback
 *   onEdit       — open edit modal callback
 *   onDeleted    — callback after deletion
 *   onStatusChange — callback after status change
 *   showToast    — show toast notification
 */
function TodoItem({ todo, selected, onSelect, onEdit, onDeleted, onStatusChange, showToast }) {
  const navigate = useNavigate();

  const handleCheckboxChange = async () => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await updateTodoStatus(todo.id, newStatus);
      onStatusChange(res.data);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${todo.title}"?`)) return;
    try {
      await deleteTodo(todo.id);
      showToast('🗑️ Todo deleted', 'success');
      onDeleted(todo.id);
    } catch {
      showToast('Failed to delete todo', 'error');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(todo);
  };

  const handleViewDetail = () => {
    // Navigate to the detail page with ?id= query param
    navigate(`/todo?id=${todo.id}`);
  };

  const overdue = isOverdue(todo.due_date, todo.status);
  const isCompleted = todo.status === 'completed';

  return (
    <div
      className={`todo-card ${isCompleted ? 'completed' : ''}`}
      onClick={handleViewDetail}
      title="Click to view details"
    >
      {/* Bulk select checkbox */}
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={selected}
        onChange={(e) => { e.stopPropagation(); onSelect(todo.id); }}
        title="Select for bulk action"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Card body */}
      <div className="todo-body">
        <div className="todo-title">{todo.title}</div>

        {/* Meta row: badges + due date + tags */}
        <div className="todo-meta">
          <span className={`badge badge-${todo.status}`}>{todo.status}</span>
          <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>

          {todo.due_date && (
            <span className={`todo-date ${overdue ? 'overdue' : ''}`}>
              📅 {overdue ? '⚠️ Overdue: ' : ''}{formatDate(todo.due_date)}
            </span>
          )}

          {/* Tags */}
          {Array.isArray(todo.tags) && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
              {todo.tags.length > 3 && (
                <span className="tag-chip">+{todo.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="todo-actions" onClick={(e) => e.stopPropagation()}>
        {/* Toggle complete */}
        <button
          className="icon-btn"
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          onClick={(e) => { e.stopPropagation(); handleCheckboxChange(); }}
        >
          {isCompleted ? '↩️' : '✅'}
        </button>

        {/* Edit */}
        <button className="icon-btn" title="Edit" onClick={handleEdit}>
          ✏️
        </button>

        {/* Delete */}
        <button className="icon-btn delete" title="Delete" onClick={handleDelete}>
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
