const express = require('express');
const { register, login, refresh , getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator , refreshValidator } = require('../validators/authValidator');
const {verifyToken} = require("../middleware/authMiddleware");
const validateRequest = require('../middleware/validateRequest');
const redisCache = require('../middleware/redisMiddleware');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator , validateRequest, login);
router.post('/refresh', refreshValidator , validateRequest, refresh);
router.get('/me', verifyToken , redisCache('user-profile', 300),getProfile);


module.exports = router;
