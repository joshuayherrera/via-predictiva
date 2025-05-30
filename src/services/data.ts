import type { PredictionResponse, HourlyPredictionResponse } from './api';

export interface MockPrediction {
  lat: number;
  lng: number;
  risk: number; // 0 to 1
  address?: string;
  severity?: string;
  probability?: string;
  probabilityHigh?: string;
  probabilityLow?: string;
  typeOfRoad?: string;
  roadNetwork?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string; 
  hour?: number;
}

export interface TimeSeriesDataPoint {
  hora: number; // 0-23
  count: number;
  probability?: number; // Nueva propiedad para probabilidades reales
}

export interface ModalityDataPoint {
  modalidad: string;
  count: number;
}

export interface MockHistoryData {
  timeSeries: TimeSeriesDataPoint[];
  modalities: ModalityDataPoint[];
}

// Transform hourly prediction response to TimeSeriesDataPoint array
export const transformHourlyPredictionResponse = (response: HourlyPredictionResponse): TimeSeriesDataPoint[] => {
  const timeSeriesData: TimeSeriesDataPoint[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString();
    const probability = response.PROBABILIDADES_HORAS[hourStr] || 0;
    
    timeSeriesData.push({
      hora: hour,
      count: Math.round(probability * 100), // Convert probability to percentage for display
      probability: probability
    });
  }
  
  return timeSeriesData;
};

// Transform API response to our app's format
export const transformPredictionResponse = (response: PredictionResponse, address?: string): MockPrediction => {
  // Convert severity to numerical risk value for color mapping
  let riskValue = 0;
  switch (response.PREDICCION.SEVERIDAD) {
    case "ALTA": riskValue = 0.8; break;
    case "MEDIA": riskValue = 0.5; break;
    case "BAJA": riskValue = 0.2; break;
    default: riskValue = 0.2;
  }
  
  return {
    lat: parseFloat(response.Entrada.LATITUD),
    lng: parseFloat(response.Entrada.LONGITUD),
    risk: riskValue,
    address: address,
    severity: response.PREDICCION.SEVERIDAD,
    probability: response.PREDICCION.PROBABILIDAD,
    probabilityHigh: response.PREDICCION.PROBABILIDADES.ALTA,
    probabilityLow: response.PREDICCION.PROBABILIDADES.BAJA,
    typeOfRoad: response.Entrada.TIPO_DE_VIA,
    roadNetwork: response.Entrada.RED_VIAL,
    departamento: response.Entrada.DEPARTAMENTO,
    provincia: response.Entrada.PROVINCIA,
    distrito: response.Entrada.DISTRITO,
    hour: response.Entrada.HORA
  };
};

// Function to generate a single mock prediction for the modal
export const getMockSinglePrediction = (lat: number, lng: number, geocodedAddress?: string): MockPrediction => {
  return {
    lat: lat, 
    lng: lng,
    risk: Math.random(),
    address: geocodedAddress || `Calle Ficticia ${Math.floor(Math.random() * 1000)}, Lima`,
    severity: Math.random() > 0.5 ? "ALTA" : "BAJA",
    probability: `${(Math.random() * 100).toFixed(2)}%`,
    probabilityHigh: `${(Math.random() * 100).toFixed(2)}%`,
    probabilityLow: `${(Math.random() * 100).toFixed(2)}%`,
    typeOfRoad: "AVENIDA",
    roadNetwork: "URBANA"
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
