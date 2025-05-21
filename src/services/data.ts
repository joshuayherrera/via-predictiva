export interface MockPrediction {
  lat: number;
  lng: number;
  risk: number; // 0 to 1
  address?: string; 
}

export interface TimeSeriesDataPoint {
  hora: number; // 0-23
  count: number;
}

export interface ModalityDataPoint {
  modalidad: string;
  count: number;
}

export interface MockHistoryData {
  timeSeries: TimeSeriesDataPoint[];
  modalities: ModalityDataPoint[];
}

// Function to generate a single mock prediction for the modal
export const getMockSinglePrediction = (lat: number, lng: number, geocodedAddress?: string): MockPrediction => {
  return {
    lat: lat, 
    lng: lng,
    risk: Math.random(),
    address: geocodedAddress || `Calle Ficticia ${Math.floor(Math.random() * 1000)}, Lima`, // Use geocoded address or fallback
  };
};

// Function to generate multiple mock predictions for the circles on the map
export const getMockMapPredictions = (lat: number, lng: number, count: number = 7): MockPrediction[] => {
  const predictions: MockPrediction[] = [];
  for (let i = 0; i < count; i++) {
    predictions.push({
      // Spread predictions around the clicked point
      lat: lat + (Math.random() - 0.5) * 0.02, 
      lng: lng + (Math.random() - 0.5) * 0.02,
      risk: Math.random(),
    });
  }
  return predictions;
};

export const getMockHistoryData = (/* lat: number, lng: number */): MockHistoryData => {
  const timeSeries: TimeSeriesDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    timeSeries.push({ hora: i, count: Math.floor(Math.random() * 12) });
  }

  const modalities: ModalityDataPoint[] = [
    { modalidad: 'Colisión', count: Math.floor(Math.random() * 25) },
    { modalidad: 'Atropello', count: Math.floor(Math.random() * 18) },
    { modalidad: 'Despiste', count: Math.floor(Math.random() * 12) },
    { modalidad: 'Vuelco', count: Math.floor(Math.random() * 8) },
    { modalidad: 'Otro', count: Math.floor(Math.random() * 5) },
  ];

  return { timeSeries, modalities };
};
