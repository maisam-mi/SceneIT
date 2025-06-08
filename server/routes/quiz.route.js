const express = require('express');
const { authMiddleware } = require('../authorization');
const controller = require('../controller/quiz.controller');

const router = express.Router();

// Route to submit quiz answers and get recommendations
// This route is protected by authMiddleware as it involves user-specific data
router.post('/submit', authMiddleware, controller.submitQuizAndGetRecommendations);

module.exports = router;