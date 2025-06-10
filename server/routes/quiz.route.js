const express = require('express');
const { authMiddleware } = require('../authorization');
const controller = require('../controller/quiz.controller');

const router = express.Router();

router.post('/save-results', authMiddleware, controller.saveQuizResults);


router.get('/recommendations', authMiddleware, controller.getQuizRecommendations);

router.get('/get-results', authMiddleware, controller.getQuizResults);

module.exports = router;