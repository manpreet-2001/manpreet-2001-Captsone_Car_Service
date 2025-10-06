const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addServiceHistory,
  getVehiclesByOwner
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const { validateVehicle, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Owner routes
router.route('/')
  .get(getVehicles)
  .post(validateVehicle, createVehicle);

router.route('/owner/:ownerId')
  .get(authorize('admin', 'mechanic'), validateObjectId('ownerId'), getVehiclesByOwner);

router.route('/:id')
  .get(validateObjectId('id'), getVehicle)
  .put(validateObjectId('id'), validateVehicle, updateVehicle)
  .delete(validateObjectId('id'), deleteVehicle);

router.route('/:id/service-history')
  .post(validateObjectId('id'), addServiceHistory);

module.exports = router;
