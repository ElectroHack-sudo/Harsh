/**
 * Content Calendar Routes
 * Imported by: server.js line 12
 * Handles content scheduling calendar view
 */
const express = require('express');
const router = express.Router();

/**
 * @route GET /api/calendar
 * @desc Get calendar events for a month
 */
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    // Mock calendar data
    const events = [
      {
        id: '1',
        title: 'Gaming Tips Video',
        type: 'video',
        platforms: ['youtube', 'instagram'],
        scheduled_at: `${targetYear}-${String(targetMonth).padStart(2, '0')}-29T19:30:00Z`,
        status: 'scheduled',
        thumbnail: '/uploads/thumb1.jpg'
      },
      {
        id: '2',
        title: 'Behind the Scenes',
        type: 'short',
        platforms: ['instagram', 'tiktok'],
        scheduled_at: `${targetYear}-${String(targetMonth).padStart(2, '0')}-30T14:00:00Z`,
        status: 'scheduled',
        thumbnail: '/uploads/thumb2.jpg'
      },
      {
        id: '3',
        title: 'Tutorial Series Ep.5',
        type: 'video',
        platforms: ['youtube'],
        scheduled_at: `${targetYear}-${String(targetMonth).padStart(2, '0')}-31T10:00:00Z`,
        status: 'scheduled',
        thumbnail: '/uploads/thumb3.jpg'
      }
    ];

    res.json({
      success: true,
      month: parseInt(targetMonth),
      year: parseInt(targetYear),
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

/**
 * @route GET /api/calendar/day/:date
 * @desc Get all events for a specific day
 */
router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const events = [
      {
        id: '1',
        title: 'Gaming Tips Video',
        type: 'video',
        platforms: ['youtube', 'instagram'],
        scheduled_at: `T19:30:00Z`,
        status: 'scheduled',
        description: 'Top 5 gaming tips for beginners'
      }
    ];

    res.json({
      success: true,
      date,
      events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch day events' });
  }
});

/**
 * @route POST /api/calendar/event
 * @desc Create a new calendar event
 */
router.post('/event', async (req, res) => {
  try {
    const { title, type, platforms, scheduled_at, description, thumbnail } = req.body;

    if (!title || !scheduled_at) {
      return res.status(400).json({ error: 'Title and scheduled time are required' });
    }

    const event = {
      id: Date.now().toString(),
      title,
      type,
      platforms,
      scheduled_at,
      description,
      thumbnail,
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * @route PUT /api/calendar/event/:id
 * @desc Update/reschedule a calendar event
 */
router.put('/event/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * @route DELETE /api/calendar/event/:id
 * @desc Delete a calendar event
 */
router.delete('/event/:id', async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

/**
 * @route POST /api/calendar/event/:id/duplicate
 * @desc Duplicate a calendar event
 */
router.post('/event/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    const duplicateEvent = {
      id: Date.now().toString(),
      original_id: id,
      title: 'Copy of Event',
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Event duplicated successfully',
      event: duplicateEvent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate event' });
  }
});

module.exports = router;
