const express = require('express');
const router = express.Router();
const {
  authGoogle, authCompleteSignup, authMe, authLogout,
} = require('../controllers/auth-controllers');

router.post('/google', authGoogle);
router.post('/complete-signup', authCompleteSignup);
router.get('/me', authMe);
router.post('/logout', authLogout);

module.exports = router;