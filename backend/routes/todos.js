const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ─────────────────────────────────────────────
// GET /api/todos
// Returns all todos, supports ?status=, ?priority=, ?search=, ?sort=
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, sort = 'created_at', order = 'DESC' } = req.query;

    // Whitelist allowed sort columns to prevent SQL injection
    const allowedSort = ['created_at', 'updated_at', 'due_date', 'title', 'priority'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
    const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    let query = 'SELECT * FROM todos WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/todos error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// GET /api/todos/:id
// Returns a single todo by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('GET /api/todos/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/todos
// Creates a new todo
// Body: { title, description, priority, status, due_date, tags }
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'pending', due_date, tags = [] } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO todos (title, description, priority, status, due_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title.trim(), description || null, priority, status, due_date || null, tags]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('POST /api/todos error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/todos/:id
// Updates a todo fully (all fields optional except id)
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, tags } = req.body;

    // Check existence first
    const existing = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    const old = existing.rows[0];

    const result = await pool.query(
      `UPDATE todos
       SET title = $1,
           description = $2,
           priority = $3,
           status = $4,
           due_date = $5,
           tags = $6
       WHERE id = $7
       RETURNING *`,
      [
        title !== undefined ? title.trim() : old.title,
        description !== undefined ? description : old.description,
        priority !== undefined ? priority : old.priority,
        status !== undefined ? status : old.status,
        due_date !== undefined ? due_date : old.due_date,
        tags !== undefined ? tags : old.tags,
        id,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PUT /api/todos/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/todos/:id/status
// Quick status toggle (mark complete, in-progress, etc.)
// Body: { status }
// ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'in-progress', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE todos SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/todos/:id/status error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/todos/:id
// Deletes a single todo
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/todos/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/todos/bulk
// Deletes multiple todos by IDs
// Body: { ids: [1, 2, 3] }
// ─────────────────────────────────────────────
router.delete('/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
    }

    const result = await pool.query(
      'DELETE FROM todos WHERE id = ANY($1::int[]) RETURNING id',
      [ids]
    );

    res.json({ success: true, message: `${result.rowCount} todo(s) deleted` });
  } catch (err) {
    console.error('DELETE /api/todos/bulk/delete error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
