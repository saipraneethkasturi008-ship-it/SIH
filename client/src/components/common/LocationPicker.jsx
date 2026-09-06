import React, { useEffect, useState } from 'react';
import { LocateFixed, MapPin, Save } from 'lucide-react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';

import { detectUserLocation } from '../../services/locationService.js';

const DEFAULT_POSITION = [16.3067, 80.4365];

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click: ({ latlng }) => {
      onSelect([latlng.lat, latlng.lng]);
    }
  });

  return null;
};

const MapViewport = ({ position, zoom = 13 }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(position, zoom, {
      animate: true
    });
  }, [map, position, zoom]);

  return null;
};

const LocationPicker = ({ location, onSaved }) => {
  const [position, setPosition] = useState(
    location?.latitude && location?.longitude
      ? [location.latitude, location.longitude]
      : null
  );

  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState(
    location || null
  );

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setPosition([
        Number(location.latitude),
        Number(location.longitude)
      ]);

      setResolvedLocation(location);
    }
  }, [location]);

  useEffect(() => {
    if (position || !navigator.geolocation) return;

    detectCurrentLocation(false);
  }, []);

  const selectPosition = (nextPosition) => {
    setPosition(nextPosition);
    setResolvedLocation(null);
    setMessage('');
    setError('');
  };

  const detectCurrentLocation = async (showErrors = true) => {
    setIsLocating(true);

    if (showErrors) {
      setError('');
    }

    try {
      const current = await detectUserLocation();

      const nextPosition = [
        Number(current.latitude),
        Number(current.longitude)
      ];

      console.log('Detected browser location:', current);

      setPosition(nextPosition);

      setResolvedLocation({
        latitude: current.latitude,
        longitude: current.longitude,
        city: current.city,
        district: current.district,
        state: current.state,
        country: current.country,
        display_name: current.display_name
      });

      setMessage('');
      setError('');
    } catch (reason) {
      console.error('Location detection failed:', reason);

      if (showErrors) {
        setError(
          'Could not detect your location. Select a point on the map instead.'
        );
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    /*
     * Check the real JWT directly.
     * The frontend may not have restored AuthContext yet,
     * but the token is what the backend actually needs.
     */
    const token = localStorage.getItem('vm_token');

    if (!token) {
      setError('Please sign in before saving your location.');
      return;
    }

    if (!position || isSaving) return;

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const saved = await onSaved(
        position[0],
        position[1]
      );

      setResolvedLocation(saved);
      setMessage('Location saved successfully.');
    } catch (saveError) {
      console.error('Location save failed:', saveError);

      setError(
        saveError?.response?.data?.message ||
        saveError?.message ||
        'Unable to save this location. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4"
      aria-labelledby="location-picker-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="location-picker-title"
            className="flex items-center gap-2 text-base font-bold text-slate-900"
          >
            <MapPin className="h-5 w-5 text-orange-600" />
            Choose your business location
          </h3>

          <p className="mt-1 text-xs text-slate-700">
            Use your current location or tap anywhere on the map to select
            coordinates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => detectCurrentLocation(true)}
          disabled={isLocating || isSaving}
          className="inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-white px-3 py-2 text-xs font-bold text-orange-800 hover:bg-orange-50 disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />

          {isLocating
            ? 'Locating...'
            : 'Use current location'}
        </button>
      </div>

      <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 sm:h-80">
        <MapContainer
          center={position || DEFAULT_POSITION}
          zoom={position ? 13 : 5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={selectPosition} />

          <MapViewport
            position={position}
            zoom={13}
          />

          {position && (
            <CircleMarker
              center={position}
              radius={10}
              pathOptions={{
                color: '#c2410c',
                fillColor: '#f97316',
                fillOpacity: 0.85
              }}
            />
          )}
        </MapContainer>
      </div>

      {position && (
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="rounded-xl bg-white p-3">
            <span className="block font-semibold text-slate-600">
              Latitude
            </span>

            <strong>
              {position[0].toFixed(6)}
            </strong>
          </div>

          <div className="rounded-xl bg-white p-3">
            <span className="block font-semibold text-slate-600">
              Longitude
            </span>

            <strong>
              {position[1].toFixed(6)}
            </strong>
          </div>
        </div>
      )}

      {resolvedLocation && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
          <strong className="block">
            {resolvedLocation.display_name ||
              'Saved location'}
          </strong>

          <span>
            {[
              resolvedLocation.city,
              resolvedLocation.district,
              resolvedLocation.state,
              resolvedLocation.country
            ]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      )}

      {message && (
        <p
          className="text-xs font-semibold text-emerald-700"
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="text-xs font-semibold text-rose-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={
          !position ||
          isSaving ||
          isLocating
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />

        {isSaving
          ? 'Saving location...'
          : 'Use this location'}
      </button>
    </section>
  );
};

export default LocationPicker;