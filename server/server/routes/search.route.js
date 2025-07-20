const express = require('express');
const controller = require('../controller/search.controller');

const router = express.Router();

// Route for searching movies/TV shows
router.get('/', controller.searchMedia); 

module.exports = router;