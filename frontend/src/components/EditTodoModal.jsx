import React, { useState, useEffect } from 'react';
import { updateTodo } from '../api/todos';

/**
 * EditTodoModal
 * Modal dialog for editing an existing todo.
 * Props:
 *   todo      — the todo object to edit
 *   onClose   — close the modal
 *   onUpdated — callback with the updated todo
 *   showToast — function to show toast notification
 */
function EditTodoModal({ todo, onClose, onUpdated, showToast }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form with existing todo data
  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        status: todo.status || 'pending',
        due_date: todo.due_date ? todo.due_date.split('T')[0] : '',
        tags: Array.isArray(todo.tags) ? todo.tags.join(', ') : '',
      });
    }
  }, [todo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const res = await updateTodo(todo.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
        tags: tagsArray,
      });

      showToast('✏️ Todo updated!', 'success');
      onUpdated(res.data);
    } catch (err) {
      setError(err.message || 'Failed to update todo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <h2 id="edit-modal-title">✏️ Edit Todo</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="edit-title">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="edit-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              autoFocus
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-priority">Priority</label>
              <select id="edit-priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-status">Status</label>
              <select id="edit-status" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-due_date">Due Date</label>
              <input
                id="edit-due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-tags">Tags <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(comma separated)</span></label>
              <input
                id="edit-tags"
                name="tags"
                type="text"
                placeholder="e.g. work, urgent"
                value={form.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>
              ⚠️ {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTodoModal;
