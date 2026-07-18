/// <reference types="vite/client" />
import axios from 'axios';

export interface NormalizedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  formattedAddress: string;
  placeName: string;
  road: string;
  neighbourhood: string;
  locality: string;
  suburb: string;
  village: string;
  town: string;
  city: string;
  district: string;
  county: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  googleMapsUrl: string;
  timestamp: number;
}

export const getMapboxAccessToken = (): string => {
  const metaEnv = (import.meta as any).env;
  return metaEnv?.VITE_MAPBOX_ACCESS_TOKEN || '';
};

/**
 * Reverse Geocodes coordinates using Mapbox Reverse Geocoding API v5
 * and normalizes the response into a unified location object.
 */
export const reverseGeocodeMapbox = async (
  latitude: number,
  longitude: number,
  accuracy: number = 0
): Promise<NormalizedLocation> => {
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates provided for reverse geocoding.');
  }

  const accessToken = getMapboxAccessToken();
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const currentTimestamp = Date.now();

  // If no Mapbox token is provided, return default normalized structure with Google Maps URL
  if (!accessToken) {
    console.warn('[MapboxService] VITE_MAPBOX_ACCESS_TOKEN is not set. Returning basic coordinates location.');
    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy,
      formattedAddress: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
      placeName: '',
      road: '',
      neighbourhood: '',
      locality: '',
      suburb: '',
      village: '',
      town: '',
      city: '',
      district: '',
      county: '',
      state: '',
      stateCode: '',
      postalCode: '',
      country: '',
      countryCode: '',
      googleMapsUrl,
      timestamp: currentTimestamp,
    };
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address,poi,neighborhood,locality,place,district,region,postcode,country`;

  try {
    const response = await axios.get(endpoint, { timeout: 10000 });
    const data = response.data;

    if (!data || !data.features || data.features.length === 0) {
      throw new Error('No location details returned from Mapbox reverse geocoding service.');
    }

    const primaryFeature = data.features[0];
    const placeName = primaryFeature.place_name || primaryFeature.text || '';
    const formattedAddress = primaryFeature.place_name || primaryFeature.text || '';

    let road = '';
    let neighbourhood = '';
    let locality = '';
    let suburb = '';
    let village = '';
    let town = '';
    let city = '';
    let district = '';
    let county = '';
    let state = '';
    let stateCode = '';
    let postalCode = '';
    let country = '';
    let countryCode = '';

    // Extract road / street from primary feature or context
    if (primaryFeature.place_type?.includes('address') || primaryFeature.place_type?.includes('poi')) {
      road = primaryFeature.text || '';
    }

    // Inspect feature contexts
    const contextList = primaryFeature.context || [];
    const allFeatures = [primaryFeature, ...contextList];

    let rawPlace = '';
    let rawDistrict = '';
    let rawLocality = '';
    let rawNeighbourhood = '';

    for (const item of allFeatures) {
      const id = item.id || '';
      const text = item.text || '';
      const shortCode = item.short_code || '';

      if (id.startsWith('neighborhood')) {
        neighbourhood = text;
        rawNeighbourhood = text;
      } else if (id.startsWith('locality')) {
        locality = text;
        rawLocality = text;
        suburb = suburb || text;
      } else if (id.startsWith('place')) {
        rawPlace = text;
        town = town || text;
      } else if (id.startsWith('district')) {
        rawDistrict = text;
        county = county || text;
      } else if (id.startsWith('region')) {
        state = text;
        stateCode = shortCode ? shortCode.toUpperCase() : '';
      } else if (id.startsWith('postcode')) {
        postalCode = text;
      } else if (id.startsWith('country')) {
        country = text;
        countryCode = shortCode ? shortCode.toUpperCase() : '';
      }
    }

    // Clean district name (e.g. "Lucknow District" -> "Lucknow")
    const cleanDistrict = rawDistrict.replace(/\s+district$/i, '').trim();

    // Smart City vs Sub-district / Tehsil assignment
    if (cleanDistrict) {
      district = cleanDistrict;
      city = cleanDistrict; // Assign major city/district (e.g. Lucknow)
      if (rawPlace && rawPlace.toLowerCase() !== cleanDistrict.toLowerCase()) {
        suburb = rawPlace; // "Bakshi Ka Talab"
        if (!locality) locality = rawPlace;
      }
    } else if (rawPlace) {
      city = rawPlace;
    } else if (rawLocality) {
      city = rawLocality;
    }

    // Fallbacks for locality and area
    if (rawNeighbourhood) {
      locality = rawNeighbourhood;
    } else if (!locality && suburb) {
      locality = suburb;
    }

    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy,
      formattedAddress,
      placeName,
      road,
      neighbourhood,
      locality,
      suburb,
      village,
      town,
      city,
      district,
      county,
      state,
      stateCode,
      postalCode,
      country,
      countryCode,
      googleMapsUrl,
      timestamp: currentTimestamp,
    };
  } catch (error: any) {
    console.error('[MapboxService] Error during reverse geocoding:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid Mapbox access token provided.');
    }
    throw new Error(error.message || 'Failed to resolve location via Mapbox reverse geocoding.');
  }
};
