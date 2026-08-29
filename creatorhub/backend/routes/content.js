/**
 * Content Routes
 * Imported by: server.js line 7
 * Handles content CRUD operations
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { status, platform, type, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (platform) {
      query += ` AND $${paramCount} = ANY(platforms)`;
      params.push(platform);
      paramCount++;
    }
    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, content: result.rows });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query('SELECT * FROM content WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json({ success: true, content: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { title, description, type, platforms, tags, hashtags, media_url, thumbnail_url, status, scheduled_at, ai_generated } = req.body;
    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO content (id, title, description, type, platforms, tags, hashtags, media_url, thumbnail_url, status, scheduled_at, ai_generated, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
      [id, title, description, type, platforms || [], tags || [], hashtags || [], media_url, thumbnail_url, status || 'draft', scheduled_at, ai_generated || false]
    );
    res.status(201).json({ success: true, message: 'Content created', content: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create content' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const result = await db.query(`UPDATE content SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json({ success: true, message: 'Content updated', content: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const result = await db.query('DELETE FROM content WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const original = await db.query('SELECT * FROM content WHERE id = $1', [id]);
    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    const content = original.rows[0];
    const newId = uuidv4();
    const result = await db.query(
      `INSERT INTO content (id, title, description, type, platforms, tags, hashtags, media_url, thumbnail_url, status, ai_generated, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', $10, NOW(), NOW()) RETURNING *`,
      [newId, `${content.title} (Copy)`, content.description, content.type, content.platforms, content.tags, content.hashtags, content.media_url, content.thumbnail_url, content.ai_generated]
    );
    res.status(201).json({ success: true, message: 'Content duplicated', content: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate content' });
  }
});

module.exports = router;
