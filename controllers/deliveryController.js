const DeliveryModel = require('../models/deliveryModel');

const checkDeliverability = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Latitude (lat) and Longitude (lng) are explicitly required to calculate distance.' });

        const result = await DeliveryModel.isAddressDeliverable(lat, lng);
        res.status(200).json({ success: true, data: result });
    } catch (e) { next(e); }
};

const getDeliverySlots = async (req, res, next) => {
    try {
        const slots = await DeliveryModel.getSlots();
        res.status(200).json({ success: true, count: slots.length, slots });
    } catch (e) { next(e); }
};

const trackOrder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const tracking = await DeliveryModel.getDeliveryTracking(orderId);
        
        if (!tracking) return res.status(404).json({ success: false, message: 'Order tracking log not found' });
        
        res.status(200).json({ success: true, tracking });
    } catch (e) { next(e); }
};

const getAllZones = async (req, res, next) => {
    try {
        const zones = await DeliveryModel.getZones();
        res.status(200).json({ success: true, count: zones.length, zones });
    } catch (e) { next(e); }
};

const createZone = async (req, res, next) => {
    try {
        const { name, radius_km, center_lat, center_lng } = req.body;
        if (!name || !radius_km || !center_lat || !center_lng) {
            return res.status(400).json({ success: false, message: 'All fields (name, radius_km, center_lat, center_lng) are required.' });
        }
        const zoneId = await DeliveryModel.createZone(name, radius_km, center_lat, center_lng);
        res.status(201).json({ success: true, message: 'Delivery zone created successfully', zoneId });
    } catch (e) { next(e); }
};

const updateZone = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await DeliveryModel.updateZone(id, req.body);
        if (!updated) return res.status(404).json({ success: false, message: 'Zone not found' });
        res.status(200).json({ success: true, message: 'Zone updated successfully' });
    } catch (e) { next(e); }
};

const deleteZone = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await DeliveryModel.deleteZone(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Zone not found' });
        res.status(200).json({ success: true, message: 'Zone deleted successfully' });
    } catch (e) { next(e); }
};

module.exports = { checkDeliverability, getDeliverySlots, trackOrder, getAllZones, createZone, updateZone, deleteZone };
