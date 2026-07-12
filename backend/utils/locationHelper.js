const Mosque = require('../models/Mosque');

/**
 * Calculates straight-line distance in meters between two coordinates.
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Step 1: Queries nearby mosques using MongoDB Geospatial indexing within a given max straight-line distance.
 * Coordinates in MongoDB are stored as [longitude, latitude].
 */
const findNearbyMosques = async (lat, lng, maxDistanceMeters = 1500, limit = 20) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates coordinates provided for findNearbyMosques');
  }

  return await Mosque.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  }).limit(limit);
};

/**
 * Step 2: Calculates actual walking distance and duration between two coordinates using OSRM Foot Routing API.
 * Includes a robust straight-line fallback in case of OSRM failure or downtime.
 */
const calculateWalkingDistance = async (startLat, startLng, endLat, endLng) => {
  const sLat = parseFloat(startLat);
  const sLng = parseFloat(startLng);
  const eLat = parseFloat(endLat);
  const eLng = parseFloat(endLng);

  if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
    throw new Error('Invalid coordinates provided for calculateWalkingDistance');
  }

  // OSRM walking/foot routing URL
  const url = `http://router.project-osrm.org/route/v1/foot/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MosqueDirectoryApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`OSRM API returned status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: Math.round(route.distance), // in meters
        duration: Math.round(route.duration), // in seconds
        geometry: route.geometry, // GeoJSON LineString route
        isFallback: false,
      };
    }

    throw new Error('No valid routing path found in OSRM response');
  } catch (error) {
    console.error(`[OSRM Routing] Routing request failed. Using Haversine fallback. Reason:`, error.message);

    // Haversine fallback
    const straightLineDistance = getHaversineDistance(sLat, sLng, eLat, eLng);
    // Average human walking speed: 5 km/h = 1.39 meters per second
    const estimatedDurationSeconds = Math.round(straightLineDistance / 1.389);

    return {
      distance: Math.round(straightLineDistance),
      duration: estimatedDurationSeconds,
      geometry: {
        type: 'LineString',
        coordinates: [
          [sLng, sLat],
          [eLng, eLat],
        ],
      },
      isFallback: true,
    };
  }
};

/**
 * Step 3: Combined service wrapper to get nearby mosques, resolve their walking distances,
 * filter them by maximum walking distance, and return sorted results.
 */
const getNearbyMosquesWithWalkingDistance = async (lat, lng, filterRadiusMeters = 1000, limit = 20) => {
  // Query slightly larger buffer in straight-line to find mosques that might exceed the radius via walking
  const queryBufferMeters = Math.max(filterRadiusMeters * 1.5, 1500); 
  
  // Find mosques via MongoDB geospatial query
  const rawNearbyMosques = await findNearbyMosques(lat, lng, queryBufferMeters, limit);

  // Map to obtain actual walking distances from OSRM
  const walkingMosquesPromises = rawNearbyMosques.map(async (mosque) => {
    const routingDetails = await calculateWalkingDistance(
      lat,
      lng,
      mosque.latitude,
      mosque.longitude
    );

    return {
      ...mosque.toObject(),
      distance: routingDetails.distance, // Overwrite with actual walking distance in meters
      duration: routingDetails.duration, // Add estimated walking duration in seconds
      geometry: routingDetails.geometry, // Add GeoJSON route LineString
      isWalkingRoute: !routingDetails.isFallback,
    };
  });

  const resolvedMosques = await Promise.all(walkingMosquesPromises);

  // Filter mosques by actual walking distance (based on request filter) and sort closest-first
  return resolvedMosques
    .filter((mosque) => mosque.distance <= filterRadiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = {
  findNearbyMosques,
  calculateWalkingDistance,
  getNearbyMosquesWithWalkingDistance,
};
