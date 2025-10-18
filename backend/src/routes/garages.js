const express = require('express');
const router = express.Router();
const {
  getGarages,
  getGarage,
  createGarage,
  updateGarage,
  deleteGarage,
  addMechanic,
  removeMechanic,
  getGarageServices
} = require('../controllers/garageController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getGarages);
router.get('/:id', getGarage);
router.get('/:id/services', getGarageServices);

// Protected routes
router.post('/', protect, createGarage);
router.put('/:id', protect, updateGarage);
router.delete('/:id', protect, deleteGarage);
router.post('/:id/mechanics', protect, addMechanic);
router.delete('/:id/mechanics/:mechanicId', protect, removeMechanic);

module.exports = router;

