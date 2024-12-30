// LocationAutocomplete.js
import React from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const LocationAutocomplete = ({ value, onChange, onSelect }) => {
  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });

  const handleInput = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = ({ description }) => () => {
    setValue(description, false);
    clearSuggestions();
    onSelect(description);

    getGeocode({ address: description })
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        console.log('Coordinates:', { lat, lng });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} onClick={handleSelect(suggestion)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div>
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Type a location"
      />
      {status === 'OK' && <ul>{renderSuggestions()}</ul>}
    </div>
  );
};

export default LocationAutocomplete;
