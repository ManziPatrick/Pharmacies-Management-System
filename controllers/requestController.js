const User = require('../models/user');
const logger = require('../utils/logger'); // Assume you have a logger utility

// Fetch requests for a specific pharmacy
exports.getPharmacyRequests = async (req, res) => {
    const { id } = req.params;

    logger.info(`Fetching requests for pharmacy ID: ${id}`);
    try {
        const pharmacy = await User.findById(id)
            .populate({ path: 'requestsInitiated.medicine_id', select: 'name price quantity' })
            .populate({ path: 'requestsReceived.medicine_id', select: 'name price quantity' });

        if (!pharmacy) {
            logger.warn(`Pharmacy not found: ${id}`);
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        const combinedRequests = [
            ...pharmacy.requestsInitiated,
            ...pharmacy.requestsReceived
        ];

        logger.info(`Successfully fetched requests for pharmacy: ${pharmacy.pharmacyName}`);
        res.json({
            pharmacyName: pharmacy.pharmacyName,
            email: pharmacy.email,
            requests: combinedRequests,
        });
    } catch (error) {
        logger.error(`Error fetching requests: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Fetch all requests across all pharmacies
exports.getRequests = async (req, res) => {
    logger.info(`Fetching all requests across pharmacies`);
    try {
        const users = await User.find()
            .populate({ path: 'requestsInitiated.medicine_id', select: 'name price' })
            .populate({ path: 'requestsReceived.medicine_id', select: 'name price' });

        const allRequests = users.flatMap(user => [
            ...user.requestsInitiated,
            ...user.requestsReceived
        ]);

        logger.info(`Fetched all requests successfully`);
        res.json(allRequests);
    } catch (error) {
        logger.error(`Error fetching all requests: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Create a new request and add it to the requesting pharmacy (real-time notification included)
exports.createRequest = async (req, res) => {
    const { medicine_id, requesting_pharmacy_id, fulfilling_pharmacy_id, commission } = req.body;

    logger.info(`Creating request from ${requesting_pharmacy_id} to ${fulfilling_pharmacy_id} for medicine ID: ${medicine_id}`);
    try {
        // Validate input
        if (!medicine_id || !requesting_pharmacy_id || !fulfilling_pharmacy_id) {
            logger.warn(`Missing required fields: ${req.body}`);
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const requestingPharmacy = await User.findById(requesting_pharmacy_id);
        if (!requestingPharmacy) {
            logger.warn(`Requesting pharmacy not found: ${requesting_pharmacy_id}`);
            return res.status(404).json({ message: 'Requesting pharmacy not found' });
        }

        const fulfillingPharmacy = await User.findById(fulfilling_pharmacy_id);
        if (!fulfillingPharmacy) {
            logger.warn(`Fulfilling pharmacy not found: ${fulfilling_pharmacy_id}`);
            return res.status(404).json({ message: 'Fulfilling pharmacy not found' });
        }

        const newRequest = {
            medicine_id,
            requesting_pharmacy_id,
            fulfilling_pharmacy_id,
            commission,
            status: 'Pending',
            createdAt: new Date()
        };

        requestingPharmacy.requestsInitiated.push(newRequest);
        await requestingPharmacy.save();

        fulfillingPharmacy.requestsReceived.push(newRequest);
        await fulfillingPharmacy.save();

        req.io.emit('newRequest', newRequest);
        req.io.to(fulfilling_pharmacy_id).emit('notification', {
            message: `You have a new request for medicine ID: ${medicine_id}`,
            request: newRequest
        });

        logger.info(`Request created successfully: ${JSON.stringify(newRequest)}`);
        res.status(201).json({
            message: 'Request created successfully',
            request: newRequest
        });
    } catch (error) {
        logger.error(`Error creating request: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
    const { pharmacyId, requestId } = req.params;
    const { status } = req.body;

    logger.info(`Updating request ID: ${requestId} to status: ${status} for pharmacy ID: ${pharmacyId}`);
    if (!['Pending', 'Fulfilled', 'Rejected'].includes(status)) {
        logger.warn(`Invalid status: ${status}`);
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const user = await User.findOne({ _id: pharmacyId, 'requestsInitiated._id': requestId })
            .populate({ path: 'requestsInitiated.medicine_id', select: 'name price quantity' });

        if (!user) {
            logger.warn(`Request not found for ID: ${requestId}`);
            return res.status(404).json({ message: 'Request not found' });
        }

        const request = user.requestsInitiated.id(requestId);
        request.status = status;
        await user.save();

        req.io.emit('updateRequest', request);
        req.io.to(request.requesting_pharmacy_id).emit('notification', {
            message: `Your request for medicine ID: ${request.medicine_id} has been updated to ${status}`,
            request: request
        });

        logger.info(`Request status updated: ${requestId} to ${status}`);
        res.json(request);
    } catch (error) {
        logger.error(`Error updating request status: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get requests related to a specific pharmacy ID
exports.getRequestsByPharmacyId = async (req, res) => {
    const { pharmacyId } = req.params;

    logger.info(`Fetching requests for pharmacy ID: ${pharmacyId}`);
    try {
        const user = await User.findById(pharmacyId)
            .populate({ path: 'requestsInitiated.medicine_id', select: 'name price' })
            .populate({ path: 'requestsReceived.medicine_id', select: 'name price' });

        if (!user) {
            logger.warn(`Pharmacy not found: ${pharmacyId}`);
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        const relevantRequests = [
            ...user.requestsInitiated,
            ...user.requestsReceived
        ].filter(request =>
            request.requesting_pharmacy_id?.toString() === pharmacyId ||
            request.fulfilling_pharmacy_id?.toString() === pharmacyId
        );

        if (relevantRequests.length === 0) {
            logger.warn(`No requests found for pharmacy ID: ${pharmacyId}`);
            return res.status(404).json({ message: 'No requests found for this pharmacy' });
        }

        logger.info(`Successfully fetched relevant requests for pharmacy ID: ${pharmacyId}`);
        res.json(relevantRequests);
    } catch (error) {
        logger.error(`Error fetching requests for pharmacy ID: ${pharmacyId}, Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
