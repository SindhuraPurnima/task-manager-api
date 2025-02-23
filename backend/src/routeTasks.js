const express = require('express')
const pool = require('./database.js')
const authenticateToken = require('./middleware')
const router = express.Router()

// Protected route: Get all tasks for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch tasks for the authenticated user
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.userId])
    res.status(200).json(tasks.rows)
  } catch (err) {
    console.error('Error fetching tasks:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Protected route: Create a new task
router.post('/', authenticateToken, async (req, res) => {
  const { title, description } = req.body

  // Validate input
  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  try {
    // Insert the new task into the database
    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, req.user.userId]
    )

    // Respond with the new task
    res.status(201).json({ message: 'Task created successfully', task: newTask.rows[0] })
  } catch (err) {
    console.error('Error creating task:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
    const taskId = req.params.id;
    const updates = req.body;
    
    try {
        // Log initial request details
        console.log('Update task request:', {
            taskId,
            updates,
            userId: req.user.userId
        });

        // Check task existence and ownership
        const taskCheck = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, req.user.userId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        // Build the update query
        const setClause = [];
        const values = [];
        let paramCount = 1;

        // Only include fields that are present in the updates
        if ('title' in updates) {
            setClause.push(`title = $${paramCount}`);
            values.push(updates.title);
            paramCount++;
        }
        if ('description' in updates) {
            setClause.push(`description = $${paramCount}`);
            values.push(updates.description);
            paramCount++;
        }
        if ('is_complete' in updates) {
            setClause.push(`is_complete = $${paramCount}`);
            values.push(updates.is_complete);
            paramCount++;
        }

        // Add taskId and userId to values array
        values.push(taskId, req.user.userId);

        const updateQuery = `
            UPDATE tasks 
            SET ${setClause.join(', ')}
            WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
            RETURNING *
        `;

        const result = await pool.query(updateQuery, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating task:', {
            message: err.message,
            code: err.code,
            detail: err.detail
        });
        
        res.status(500).json({ 
            error: 'Internal server error', 
            details: err.message
        });
    }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id

  try {
    const deletedTask = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, req.user.userId]
    )

    if (deletedTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (err) {
    console.error('Error deleting task:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add this debug route at the top of your routes
router.get('/debug/:id', authenticateToken, async (req, res) => {
    try {
        // Test database connection
        const testQuery = await pool.query('SELECT NOW()');
        console.log('Database connection test:', testQuery.rows[0]);

        // Try to find the task
        const taskId = req.params.id;
        const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        console.log('Task lookup result:', task.rows);

        res.json({
            dbConnected: true,
            taskFound: task.rows.length > 0,
            task: task.rows[0] || null
        });
    } catch (err) {
        console.error('Debug route error:', err);
        res.status(500).json({
            error: 'Debug route error',
            message: err.message,
            code: err.code
        });
    }
});

module.exports = router