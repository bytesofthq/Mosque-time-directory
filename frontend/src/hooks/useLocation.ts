import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { locationRateLimiter } from '../utils/locationRateLimiter';
import { reverseGeocodeMapbox, NormalizedLocation } from '../services/mapboxService';

export interface UseLocationReturn {
  location: NormalizedLocation | null;
  loading: boolean;
  error: string | null;
  warning: string | null;
  detectLocation: () => Promise<NormalizedLocation | null>;
  resetState: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<NormalizedLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setLocation(null);
    setLoading(false);
    setError(null);
    setWarning(null);
  }, []);

  const detectLocation = useCallback(async (): Promise<NormalizedLocation | null> => {
    setLoading(true);
    setError(null);
    setWarning(null);

    // 1. Check Browser Support
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
      return null;
    }

    // 2. Check Rate Limiter (Max 5 per minute)
    if (!locationRateLimiter.canMakeRequest()) {
      const rateLimitMsg = 'You have reached the maximum number of location requests. Please wait a moment before trying again.';
      setError(rateLimitMsg);
      toast.error(rateLimitMsg);
      setLoading(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy || 0;

          // Check GPS Accuracy (> 50 meters)
          if (accuracy > 50) {
            const warnMsg = 'Location accuracy is low. Please move outdoors or enable GPS for better accuracy.';
            setWarning(warnMsg);
            toast.warning(warnMsg);
          }

          // Record Request in Rate Limiter before executing Mapbox call
          locationRateLimiter.recordRequest();

          try {
            const normalizedData = await reverseGeocodeMapbox(latitude, longitude, accuracy);
            setLocation(normalizedData);
            setLoading(false);
            toast.success('Location detected and auto-filled successfully!');
            resolve(normalizedData);
          } catch (geocodeError: any) {
            const geocodeErrMsg = geocodeError.message || 'Failed to resolve address from coordinates.';
            setError(geocodeErrMsg);
            toast.error(geocodeErrMsg);
            setLoading(false);
            resolve(null);
          }
        },
        (geoError) => {
          let errMessage = 'An unknown error occurred while retrieving your location.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errMessage = 'Location permission denied. Please enable location permissions in your browser/device settings.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errMessage = 'Location information is unavailable. Please try again or enter details manually.';
              break;
            case geoError.TIMEOUT:
              errMessage = 'Location detection timed out. Please try again or check your GPS signal.';
              break;
          }
          setError(errMessage);
          toast.error(errMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    warning,
    detectLocation,
    resetState,
  };
};
