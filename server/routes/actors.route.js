const express = require('express');
const controller = require('../controller/actors.controller');

const router = express.Router();

// it responses an array of currently popular actors.
router.get('/', controller.getActors);

module.exports = router;
