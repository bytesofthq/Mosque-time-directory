/// <reference types="vite/client" />
import axios from 'axios';
import { reverseGeocode as reverseGeocodeNominatim } from '../utils/location';

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
  postcode: string;
  area: string;
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
 * with automatic fallback to OpenStreetMap Nominatim if Mapbox is unavailable.
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

  const tryNominatimFallback = async (): Promise<NormalizedLocation> => {
    try {
      const nomData: any = await reverseGeocodeNominatim(latitude, longitude);
      return {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy,
        formattedAddress: nomData.formattedAddress || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
        placeName: nomData.formattedAddress || '',
        road: nomData.road || '',
        neighbourhood: nomData.neighbourhood || nomData.area || '',
        locality: nomData.locality || '',
        suburb: nomData.suburb || '',
        village: nomData.village || '',
        town: nomData.town || '',
        city: nomData.city || '',
        district: nomData.district || '',
        county: nomData.county || '',
        state: nomData.state || '',
        stateCode: '',
        postalCode: nomData.postcode || nomData.postalCode || '',
        postcode: nomData.postcode || nomData.postalCode || '',
        area: nomData.area || nomData.neighbourhood || nomData.locality || nomData.suburb || '',
        country: nomData.country || '',
        countryCode: '',
        googleMapsUrl,
        timestamp: currentTimestamp,
      };
    } catch (nomError) {
      console.warn('[MapboxService] Nominatim fallback failed as well:', nomError);
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
        postcode: '',
        area: '',
        country: '',
        countryCode: '',
        googleMapsUrl,
        timestamp: currentTimestamp,
      };
    }
  };

  // If no Mapbox token is provided, fallback to Nominatim
  if (!accessToken) {
    console.warn('[MapboxService] VITE_MAPBOX_ACCESS_TOKEN is not set. Using Nominatim OpenStreetMap fallback.');
    return await tryNominatimFallback();
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address,poi,neighborhood,locality,place,district,region,postcode,country`;

  try {
    const response = await axios.get(endpoint, { timeout: 10000 });
    const data = response.data;

    if (!data || !data.features || data.features.length === 0) {
      console.warn('[MapboxService] No features returned from Mapbox. Trying Nominatim fallback.');
      return await tryNominatimFallback();
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

    if (primaryFeature.place_type?.includes('address') || primaryFeature.place_type?.includes('poi')) {
      road = primaryFeature.text || '';
    }

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

    const cleanDistrict = rawDistrict.replace(/\s+district$/i, '').trim();

    if (cleanDistrict) {
      district = cleanDistrict;
      city = cleanDistrict;
      if (rawPlace && rawPlace.toLowerCase() !== cleanDistrict.toLowerCase()) {
        suburb = rawPlace;
        if (!locality) locality = rawPlace;
      }
    } else if (rawPlace) {
      city = rawPlace;
    } else if (rawLocality) {
      city = rawLocality;
    }

    if (rawNeighbourhood) {
      locality = rawNeighbourhood;
    } else if (!locality && suburb) {
      locality = suburb;
    }

    const area = neighbourhood || suburb || locality || rawNeighbourhood || town || '';

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
      postcode: postalCode,
      area,
      country,
      countryCode,
      googleMapsUrl,
      timestamp: currentTimestamp,
    };
  } catch (error: any) {
    console.warn('[MapboxService] Error during Mapbox reverse geocoding, trying Nominatim fallback:', error);
    return await tryNominatimFallback();
  }
};
