const pool = require('../config/db');

class DeliveryModel {
    static async getZones() {
        const [rows] = await pool.query('SELECT * FROM DeliveryZones WHERE is_active = TRUE');
        return rows;
    }

    static async createZone(name, radius_km, center_lat, center_lng) {
        const [result] = await pool.query(
            'INSERT INTO DeliveryZones (name, radius_km, center_lat, center_lng, is_active) VALUES (?, ?, ?, ?, 1)',
            [name, radius_km, center_lat, center_lng]
        );
        return result.insertId;
    }

    static async updateZone(id, data) {
        const { name, radius_km, center_lat, center_lng, is_active } = data;
        const [result] = await pool.query(
            'UPDATE DeliveryZones SET name = ?, radius_km = ?, center_lat = ?, center_lng = ?, is_active = ? WHERE id = ?',
            [name, radius_km, center_lat, center_lng, is_active ?? 1, id]
        );
        return result.affectedRows > 0;
    }

    static async deleteZone(id) {
        // We use soft delete by setting is_active to 0
        const [result] = await pool.query('UPDATE DeliveryZones SET is_active = FALSE WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Radius Haversine distance formula algorithm
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            0.5 - Math.cos(dLat)/2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            (1 - Math.cos(dLon))/2;
        return R * 2 * Math.asin(Math.sqrt(a));
    }

    static async isAddressDeliverable(userLat, userLng) {
        const zones = await this.getZones();
        for (const zone of zones) {
            const distance = this.calculateDistance(userLat, userLng, zone.center_lat, zone.center_lng);
            if (distance <= zone.radius_km) {
                return { deliverable: true, zone: zone.name, distance_km: parseFloat(distance.toFixed(2)) };
            }
        }
        return { deliverable: false };
    }

    static async getSlots() {
        const [rows] = await pool.query('SELECT * FROM DeliverySlots WHERE is_active = TRUE ORDER BY start_time ASC');
        return rows;
    }

    static async getDeliveryTracking(orderId) {
        const [rows] = await pool.query('SELECT status, delivery_person_name, delivery_person_contact FROM Orders WHERE id = ?', [orderId]);
        if (!rows.length) return null;
        
        const order = rows[0];
        
        let mockLocation = null;
        if (order.status === 'Out for Delivery') {
            // Generating simulated GPS driver moving location mapping dynamically
            mockLocation = {
                lat: parseFloat((40.7128 + (Math.random() * 0.05)).toFixed(6)),
                lng: parseFloat((-74.0060 + (Math.random() * 0.05)).toFixed(6)),
                eta_minutes: Math.floor(Math.random() * 30) + 5
            };
        }

        return {
            status: order.status,
            delivery_person: order.delivery_person_name ? {
                name: order.delivery_person_name,
                contact: order.delivery_person_contact
            } : null,
            tracking_url: mockLocation ? `https://mock-google-maps.com/maps?q=${mockLocation.lat},${mockLocation.lng}` : null,
            live_location: mockLocation
        };
    }
}

module.exports = DeliveryModel;
