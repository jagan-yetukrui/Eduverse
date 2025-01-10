// LocationAutocomplete.js
// Component for location search with Google Places Autocomplete integration
import React from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import './LocationAutocomplete.css';

/**
 * LocationAutocomplete component provides location search functionality
 * @param {string} value - Current location input value
 * @param {function} onChange - Handler for input value changes
 * @param {function} onSelect - Handler for when a location is selected
 */
const LocationAutocomplete = ({ value, onChange, onSelect }) => {
  // Initialize Google Places Autocomplete hook
  const {
    ready, // Boolean indicating if Places API is loaded
    suggestions: { status, data }, // Autocomplete suggestions
    setValue, // Function to update input value
    clearSuggestions, // Function to clear suggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'], // Restrict to city-level results
      componentRestrictions: { country: 'US' } // Restrict to US locations
    },
    debounce: 300, // Debounce API calls
  });

  /**
   * Handle input changes
   * @param {Event} e - Input change event
   */
  const handleInput = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  /**
   * Handle selection of a location suggestion
   * Gets coordinates and calls onSelect with location details
   * @param {Object} suggestion - Selected location suggestion
   */
  const handleSelect = ({ description }) => () => {
    setValue(description, false);
    clearSuggestions();

    // Get coordinates for selected location
    getGeocode({ address: description })
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        // Pass both description and coordinates to parent
        onSelect({
          description,
          coordinates: { lat, lng }
        });
      })
      .catch((error) => {
        console.error('Error getting coordinates:', error);
      });
  };

  /**
   * Render location suggestions list
   * @returns {JSX.Element[]} Array of suggestion list items
   */
  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li 
          key={place_id} 
          onClick={handleSelect(suggestion)}
          className="location-suggestion"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div className="location-autocomplete">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Enter your city (US only)"
        className="location-input"
      />
      {status === 'OK' && (
        <ul className="suggestions-list">
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
