// src/components/SearchBox.tsx
import React from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

interface SearchBoxProps {
  onLoad: (ref: google.maps.places.SearchBox) => void;
  onPlacesChanged: () => void;
  // map?: google.maps.Map | null; // Optional: if you need to pass the map instance for bounds
}

const SearchBox: React.FC<SearchBoxProps> = ({ onLoad, onPlacesChanged }) => {
  return (
    <StandaloneSearchBox
      onLoad={onLoad}
      onPlacesChanged={onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Buscar lugar..."
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `300px`, // Adjusted width
          height: `40px`, // Adjusted height
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`,
          position: "absolute",
          left: "10px", // Position to the left
          top: "10px",
          backgroundColor: "white", // White background
          zIndex: 10 // Ensure search box is above the map
        }}
      />
    </StandaloneSearchBox>
  );
};

export default SearchBox;
