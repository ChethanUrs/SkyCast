const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLocations, addLocation, removeLocation, reorderLocations } = require('../controllers/locationController');

router.use(protect); // All location routes require auth

router.get('/', getLocations);
router.post('/', addLocation);
router.delete('/:locationId', removeLocation);
router.patch('/reorder', reorderLocations);

module.exports = router;
