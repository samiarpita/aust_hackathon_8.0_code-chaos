const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');
const { validateCreateAnalysis } = require('../middleware/validate');

/**
 * Analysis Routes (/api/analyses)
 * All routes are protected by authMiddleware
 */

// POST /api/analyses - Trigger a new misconception analysis
router.post('/', authMiddleware, validateCreateAnalysis, analysisController.createAnalysis);

// GET /api/analyses/:id - Fetch an analysis by ID
router.get('/:id', authMiddleware, analysisController.getAnalysisById);

// GET /api/analyses - List analyses (supports ?examId=<id>)
router.get('/', authMiddleware, analysisController.listAnalyses);

module.exports = router;
