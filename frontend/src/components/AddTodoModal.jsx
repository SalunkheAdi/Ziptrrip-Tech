import React, { useState } from 'react';
import { createTodo } from '../api/todos';

// Default form state
const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: '',
  tags: '',
  assigned_to: '',
};

/**
 * AddTodoModal
 * Modal dialog for creating a new todo.
 * Props:
 *   onClose  — close the modal
 *   onCreated — callback with the newly created todo
 *   showToast — function to show toast notification
 */
function AddTodoModal({ onClose, onCreated, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      const res = await createTodo({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
        tags: tagsArray,
        assigned_to: form.assigned_to || null,
      });

      showToast('✅ Todo created!', 'success');
      onCreated(res.data);
    } catch (err) {
      setError(err.message || 'Failed to create todo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
        <h2 id="add-modal-title">➕ Add New Todo</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Add more details (optional)"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assigned_to">Assign To</label>
              <select id="assigned_to" name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                <option value="">— Select person —</option>
                <option value="Aditya">👤 Aditya</option>
                <option value="Jiya">👤 Jiya</option>
                <option value="Ebineshwar">👤 Ebineshwar</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(comma separated)</span></label>
              <input
                id="tags"
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
              {loading ? 'Creating…' : 'Create Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTodoModal;
