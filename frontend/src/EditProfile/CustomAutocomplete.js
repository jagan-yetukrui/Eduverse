import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomAutocomplete component that provides Google Places autocomplete functionality
 * @param {function} onPlaceSelected - Callback function when a place is selected
 * @param {string} initialValue - Initial value for the input field
 * @param {string} placeholder - Placeholder text for the input field
 */
const CustomAutocomplete = ({ onPlaceSelected, initialValue = '', placeholder = 'Enter location' }) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState(initialValue);

  // Initialize Google Places Autocomplete when component mounts
  useEffect(() => {
    if (window.google && inputRef.current) {
      // Create autocomplete instance with location bias and type restrictions
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'], // Restrict to cities only
        fields: ['formatted_address', 'geometry', 'name'], // Specify required fields
      });

      // Handle place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          // Only update if a valid place was selected
          setValue(place.formatted_address);
          onPlaceSelected({
            formatted_address: place.formatted_address,
            name: place.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });
        }
      });
    }
  }, [onPlaceSelected]);

  // Handle manual input changes
  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className="location-input"
    />
  );
};

export default CustomAutocomplete;
