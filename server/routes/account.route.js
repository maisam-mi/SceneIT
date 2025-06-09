const express = require('express');
const { authMiddleware } = require('../authorization');
const controller = require('../controller/account.controller');

const router = express.Router();

// register route, an account is registered.
router.post('/', controller.register);

// login route, an account is logged in.
router.put('/', controller.login);

// to change the password
router.patch('/changePassword', authMiddleware, controller.changePassword);

// protected endpoint, delete route, it deleted the account
router.delete('/', authMiddleware, controller.deleteAccount);

module.exports = router;
