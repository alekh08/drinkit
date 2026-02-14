// Mock geolocation service
// In production, integrate with Google Maps API or similar

class GeoService {
    /**
     * Calculate distance between two coordinates (Haversine formula)
     * Returns distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Find nearby stores within radius
     * Mock implementation using random coordinates
     */
    async findNearbyStores(userLat, userLon, radiusKm = 10) {
        // In production, this would query stores within radius using PostGIS or similar
        // For now, we'll return all approved stores
        return radiusKm;
    }

    /**
     * Get mock coordinates for a location
     */
    getMockCoordinates(location) {
        // Mock coordinates - in production, use geocoding API
        const mockLocations = {
            'delhi': { lat: 28.6139, lng: 77.2090 },
            'mumbai': { lat: 19.0760, lng: 72.8777 },
            'bangalore': { lat: 12.9716, lng: 77.5946 },
            'default': { lat: 28.6139, lng: 77.2090 }
        };

        const key = location?.toLowerCase() || 'default';
        return mockLocations[key] || mockLocations.default;
    }

    /**
     * Find nearest available rider
     */
    async findNearestRider(storeLat, storeLon) {
        // Mock implementation
        // In production, query riders table for nearest available rider
        return {
            lat: storeLat + (Math.random() - 0.5) * 0.01,
            lng: storeLon + (Math.random() - 0.5) * 0.01
        };
    }
}

module.exports = new GeoService();
