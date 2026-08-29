/**
 * Media Library Routes
 * Imported by: server.js line 11
 * Handles file uploads and media library management
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|mp3|wav|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, videos, and audio are allowed.'));
  }
});

/**
 * @route GET /api/media
 * @desc Get all media files with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { type, search, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // For demo, return mock data
    const mockMedia = [
      { id: '1', filename: 'video1.mp4', url: '/uploads/video1.mp4', type: 'video', size: 52428800, created_at: new Date().toISOString(), thumbnail: '/uploads/thumb1.jpg' },
      { id: '2', filename: 'image1.jpg', url: '/uploads/image1.jpg', type: 'image', size: 2097152, created_at: new Date().toISOString(), thumbnail: '/uploads/image1.jpg' },
      { id: '3', filename: 'thumbnail1.png', url: '/uploads/thumb1.png', type: 'thumbnail', size: 524288, created_at: new Date().toISOString(), thumbnail: '/uploads/thumb1.png' }
    ];

    res.json({
      success: true,
      media: mockMedia,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockMedia.length
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

/**
 * @route POST /api/media/upload
 * @desc Upload a new media file
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type, category, tags } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Determine media type from file extension or explicit type
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mediaType = type || (
      ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext) ? 'video' :
      ['.mp3', '.wav', '.ogg'].includes(ext) ? 'audio' :
      ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext) ? 'image' : 'other'
    );

    const mediaData = {
      id: uuidv4(),
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: fileUrl,
      type: mediaType,
      category: category || mediaType,
      size: req.file.size,
      mime_type: req.file.mimetype,
      tags: tags ? tags.split(',') : [],
      created_at: new Date().toISOString(),
      thumbnail: null
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: mediaData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * @route POST /api/media/upload-multiple
 * @desc Upload multiple media files
 */
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      filename: file.filename,
      original_name: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      type: file.mimetype,
      created_at: new Date().toISOString()
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

/**
 * @route GET /api/media/:id
 * @desc Get single media file details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock single media response
    const media = {
      id,
      filename: `media_${id}.mp4`,
      url: `/uploads/media_${id}.mp4`,
      type: 'video',
      size: 52428800,
      duration: 120,
      width: 1920,
      height: 1080,
      created_at: new Date().toISOString(),
      metadata: {
        codec: 'h264',
        bitrate: '4500kbps',
        fps: 30
      }
    };

    res.json({
      success: true,
      media
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media details' });
  }
});

/**
 * @route PUT /api/media/:id
 * @desc Update media metadata (tags, category, etc.)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, category, title, description } = req.body;

    res.json({
      success: true,
      message: 'Media updated successfully',
      media: {
        id,
        tags,
        category,
        title,
        description,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' });
  }
});

/**
 * @route DELETE /api/media/:id
 * @desc Delete a media file
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In production: Delete file from disk and database

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

/**
 * @route GET /api/media/stats/overview
 * @desc Get media library statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        total_files: 156,
        total_size: 5368709120, // 5GB in bytes
        videos: 45,
        images: 78,
        thumbnails: 23,
        audio: 10,
        categories: {
          shorts: 32,
          reels: 28,
          posts: 45,
          thumbnails: 23,
          other: 28
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media stats' });
  }
});

module.exports = router;
