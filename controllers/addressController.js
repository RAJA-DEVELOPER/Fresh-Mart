const AddressModel = require('../models/addressModel');

const addAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Assume req.body contains street, city, state, zip_code, country
        const addressId = await AddressModel.addAddress(userId, req.body);
        res.status(201).json({ success: true, message: 'Address added successfully', addressId });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.user.id;
        const updated = await AddressModel.updateAddress(addressId, userId, req.body);
        
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Address not found or not authorized' });
        }

        res.status(200).json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.user.id;
        const deleted = await AddressModel.deleteAddress(addressId, userId);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Address not found or not authorized' });
        }

        res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const addresses = await AddressModel.getAddressesByUserId(userId);
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addAddress,
    updateAddress,
    deleteAddress,
    getAddresses
};
