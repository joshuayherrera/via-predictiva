import React, { useState, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  MarkerClusterer
} from '@react-google-maps/api';
import type { MockPrediction, MockHistoryData } from '../services/data';
import { getMockMapPredictions, getMockSinglePrediction, getMockHistoryData, transformPredictionResponse } from '../services/data';
import { sendPredictionRequest } from '../services/api';
import SearchBox from './SearchBox';
import AccidentModal from './AccidentModal';

interface MapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const getColorForRisk = (risk: number): string => {
  const r = Math.floor(255 * risk);
  const g = Math.floor(255 * (1 - risk));
  return `rgb(${r},${g},0)`;
};

const defaultMapCenter = { lat: -9.19, lng: -75.015 }; // Centered in Peru

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const MapContainer: React.FC<MapContainerProps> = ({
  center = defaultMapCenter, // Use default center if none provided
  zoom = 12,
  onPlaceSelected
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [predictions, setPredictions] = useState<MockPrediction[]>([]);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [selectedPrediction, setSelectedPrediction] = useState<MockPrediction | null>(null);
  const [historyData, setHistoryData] = useState<MockHistoryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get location details from coordinates
  const getLocationDetails = async (lat: number, lng: number): Promise<{ departamento: string, provincia: string, distrito: string } | null> => {
    if (!isLoaded) return null;
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    
    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results.length > 0) {
        // Try to extract administrative areas from the results
        let departamento = "ANCASH"; // Default values
        let provincia = "HUARMEY";
        let distrito = "HUARMEY";
        
        // Parse address components to find administrative areas
        const addressComponents = response.results[0].address_components;
        for (const component of addressComponents) {
          const types = component.types;
          if (types.includes('administrative_area_level_1')) {
            departamento = component.long_name.toUpperCase();
          } else if (types.includes('administrative_area_level_2')) {
            provincia = component.long_name.toUpperCase();
          } else if (types.includes('administrative_area_level_3') || types.includes('locality')) {
            distrito = component.long_name.toUpperCase();
          }
        }
        
        return { departamento, provincia, distrito };
      }
      return null;
    } catch (error) {
      console.error("Error in geocoding for location details:", error);
      return null;
    }
  };

  // Function to perform reverse geocoding
  const getAddressFromLatLng = async (lat: number, lng: number): Promise<string | null> => {
    if (!isLoaded) return null; // Ensure maps API is loaded
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results[0]) {
        return response.results[0].formatted_address;
      } else {
        console.warn("No results found for reverse geocoding");
        return null;
      }
    } catch (error) {
      console.error("Geocoder failed due to: ", error);
      return null;
    }
  };

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get address and location details
        const address = await getAddressFromLatLng(lat, lng);
        const locationDetails = await getLocationDetails(lat, lng);
        
        if (locationDetails) {
          // Call the prediction API
          const predictionData = {
            LATITUD: lat,
            LONGITUD: lng,
            DEPARTAMENTO: locationDetails.departamento,
            PROVINCIA: locationDetails.provincia,
            DISTRITO: locationDetails.distrito
          };
          
          const response = await sendPredictionRequest(predictionData);
          
          // Transform the response to our app's format
          const predictionResult = transformPredictionResponse(response, address || undefined);
          
          // Set the single prediction for the modal
          setSelectedPrediction(predictionResult);
          
          // Generate nearby predictions for the map
          const mapPredictions = getMockMapPredictions(lat, lng);
          setPredictions(mapPredictions);
          
          // Get mock history data (in a real app, this would come from the backend)
          const fetchedHistoryData = getMockHistoryData();
          setHistoryData(fetchedHistoryData);
          
          setIsModalOpen(true);
        } else {
          console.warn("Unable to determine location details");
          // Fall back to mock data if we can't get location details
          const singlePrediction = getMockSinglePrediction(lat, lng, address || undefined);
          setSelectedPrediction(singlePrediction);
          
          const mapPredictions = getMockMapPredictions(lat, lng);
          setPredictions(mapPredictions);
          
          const fetchedHistoryData = getMockHistoryData();
          setHistoryData(fetchedHistoryData);
          
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error("Error processing prediction:", err);
        setError("Error al obtener la predicción. Intente nuevamente.");
        
        // Fall back to mock data on error
        const address = await getAddressFromLatLng(lat, lng);
        const singlePrediction = getMockSinglePrediction(lat, lng, address || undefined);
        setSelectedPrediction(singlePrediction);
        
        const mapPredictions = getMockMapPredictions(lat, lng);
        setPredictions(mapPredictions);
        
        const fetchedHistoryData = getMockHistoryData();
        setHistoryData(fetchedHistoryData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOnLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (searchBoxRef.current && map.getBounds()) {
      searchBoxRef.current.setBounds(map.getBounds() as google.maps.LatLngBounds);
    }
  };

  const handleOnUnmount = () => {
    mapRef.current = null;
  };

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
    const peruBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-18.35, -81.33),
      new google.maps.LatLng(-0.04, -68.65)
    );
    searchBoxRef.current.setBounds(peruBounds);
  };

  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          setCurrentCenter(newCenter);
          if (mapRef.current) {
            mapRef.current.panTo(newCenter);
          }
          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
        }
      }
    }
  };

  useEffect(() => {
    setCurrentCenter(center);
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  }, [center]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrediction(null);
    setHistoryData(null);
  };

  if (loadError) {
    return <div>Error al cargar el mapa: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Cargando mapa...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoaded && (
        <SearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        />
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentCenter}
        zoom={zoom}
        onLoad={handleOnLoad}
        onUnmount={handleOnUnmount}
        onClick={handleMapClick}
        options={{
          styles: darkMapStyle, // Apply the dark map style
          restriction: {
            latLngBounds: {
              north: -0.04,
              south: -18.35,
              east: -68.65,
              west: -81.33,
            },
            strictBounds: false,
          },
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        <MarkerClusterer>
          {(clusterer) =>
            <>
              {predictions.map((pred) => (
                <Circle
                  key={`${pred.lat}-${pred.lng}-${pred.risk}`}
                  center={{ lat: pred.lat, lng: pred.lng }}
                  radius={200}
                  options={{
                    fillColor: getColorForRisk(pred.risk),
                    fillOpacity: 0.4,
                    strokeColor: getColorForRisk(pred.risk),
                    clickable: true,
                  }}
                  onClick={() => {
                    setSelectedPrediction(pred);
                    const fetchedHistoryData = getMockHistoryData();
                    setHistoryData(fetchedHistoryData);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </>
          }
        </MarkerClusterer>
      </GoogleMap>
      <AccidentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        prediction={selectedPrediction}
        historyData={historyData}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default React.memo(MapContainer);
