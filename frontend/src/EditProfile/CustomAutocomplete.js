import React, { useEffect, useRef } from 'react';

const CustomAutocomplete = ({ onPlaceSelected }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onPlaceSelected(place);
      });
    }
  }, [onPlaceSelected]);  // Add onPlaceSelected to dependencies

  return <input ref={inputRef} type="text" placeholder="Enter location" />;
};

export default CustomAutocomplete;
