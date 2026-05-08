const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPreferences, updatePreferences } = require('../controllers/preferenceController');

router.use(protect);
router.get('/', getPreferences);
router.patch('/', updatePreferences);

module.exports = router;
