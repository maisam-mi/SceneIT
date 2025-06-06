const express = require('express');
const controller = require('../controller/account.controller');

const router = express.Router();

// register route, an account is registered.
router.post('/', controller.register);

// login route, an account is logged in.
router.put('/', controller.login);

// delete route, it deleted the account
router.delete('/:username', controller.deleteAccount);

module.exports = router;
