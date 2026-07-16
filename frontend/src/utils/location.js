/**
 * Reusable Location and Geocoding Utility Functions
 * Built using free and open services: native Geolocation API and OpenStreetMap Nominatim.
 */

// Simple client-side cache for the last successful reverse geocode request
let cachedLocation = null; // Structure: { lat: number, lng: number, address: object }

// Threshold in meters below which we use cached reverse geocode data
const CACHE_DISTANCE_THRESHOLD_METERS = 15;

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in meters
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Gets the user's current GPS location.
 * @param {PositionOptions} options Geolocation options
 * @returns {Promise<{latitude: number, longitude: number}>} Coordinates object
 */
export const getCurrentLocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'An unknown error occurred while retrieving your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location permissions in your browser/device settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again or enter details manually.';
            break;
          case error.TIMEOUT:
            message = 'Location detection timed out. Please try again or check your GPS signal.';
            break;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
};

/**
 * Converts Latitude & Longitude to a structured, human-readable address.
 * Uses Nominatim OpenStreetMap (Reverse Geocoding) with caching.
 * @param {number|string} lat Latitude
 * @param {number|string} lng Longitude
 * @returns {Promise<object>} Structured address data
 */
export const reverseGeocode = async (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates provided to reverseGeocode.');
  }

  // Check cache to avoid hitting Nominatim rate limits if the user hasn't moved significantly
  if (cachedLocation) {
    const distance = getHaversineDistance(
      cachedLocation.lat,
      cachedLocation.lng,
      latitude,
      longitude
    );
    if (distance < CACHE_DISTANCE_THRESHOLD_METERS) {
      console.log(`[Location Service] Cache hit. User moved ${distance.toFixed(2)}m (threshold is ${CACHE_DISTANCE_THRESHOLD_METERS}m). Returning cached address.`);
      return {
        latitude,
        longitude,
        ...cachedLocation.address,
      };
    }
  }

  console.log(`[Location Service] Cache miss. Fetching reverse geocode from Nominatim API for: ${latitude}, ${longitude}`);
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nominatim API HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (!data || !data.address) {
      throw new Error('No address information returned from geocoding service.');
    }

    const addr = data.address;

    // Fallback Logic mapping
    // road -> street -> residential -> path -> suburb
    const road = addr.road || addr.street || addr.residential || addr.path || addr.suburb || '';

    // locality -> suburb -> neighbourhood -> village -> hamlet -> town -> city_district
    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.town || addr.city_district || '';

    // city -> city -> town -> municipality -> county -> state_district
    const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';

    const district = addr.district || addr.county || '';
    const state = addr.state || '';
    const postcode = addr.postcode || '';
    const country = addr.country || '';
    const neighbourhood = addr.neighbourhood || '';
    const suburb = addr.suburb || '';

    // Assemble formattedAddress programmatically to ensure it is clean and skips empty fields
    const addressParts = [road, locality, city, state, country].filter(Boolean);
    
    // Remove duplicates from addressParts (e.g. if city and locality resolved to the same string)
    const uniqueAddressParts = [];
    const seenParts = new Set();
    for (const part of addressParts) {
      const trimmed = part.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seenParts.has(lower)) {
        uniqueAddressParts.push(trimmed);
        seenParts.add(lower);
      }
    }
    const formattedAddress = uniqueAddressParts.join(', ') || data.display_name || '';

    const structuredAddress = {
      road,
      locality,
      neighbourhood,
      suburb,
      city,
      district,
      state,
      postcode,
      country,
      formattedAddress,
    };

    // Cache the result
    cachedLocation = {
      lat: latitude,
      lng: longitude,
      address: structuredAddress,
    };

    return {
      latitude,
      longitude,
      ...structuredAddress,
    };
  } catch (error) {
    console.error('[Location Service] Error during reverse geocoding:', error);
    throw error;
  }
};

/**
 * Converts a place name or address query into coordinates.
 * Uses Nominatim OpenStreetMap (Forward Geocoding).
 * @param {string} query Address query or location string
 * @returns {Promise<{latitude: string, longitude: string, formattedAddress: string}|null>} Resolved coordinate details or null
 */
export const forwardGeocode = async (query) => {
  if (!query || !query.trim()) {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nominatim API HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat).toFixed(6),
        longitude: parseFloat(data[0].lon).toFixed(6),
        formattedAddress: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error(`[Location Service] Error during forward geocoding for query "${query}":`, error);
    throw error;
  }
};
