const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/', requestController.getRequests);

router.post('/', requestController.createRequest);

router.put('/:pharmacyId/:requestId/status', requestController.updateRequestStatus);


router.get('/pharmacy/:pharmacyId', requestController.getRequestsByPharmacyId);

module.exports = router;