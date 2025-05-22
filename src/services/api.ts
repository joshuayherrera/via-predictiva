import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Existing API functions
export const fetchPrediction = (lat: number, lng: number, hora: number | string) =>
  API.get(`/predict?lat=${lat}&lng=${lng}&hora=${hora}`);

export const fetchHistory = (lat: number, lng: number) =>
  API.get(`/history?lat=${lat}&lng=${lng}`);

// New API function for prediction using the external backend
interface PredictionRequest {
  LATITUD: number;
  LONGITUD: number;
  DEPARTAMENTO: string;
  PROVINCIA: string;
  DISTRITO: string;
}

export interface PredictionResponse extends PredictionRequest {
  SEVERIDAD_PREDICHA: number;
  PROBABILIDAD_PELIGROSA: string;
  ZONA_PELIGROSA: boolean;
  RIESGO: string;
}

export const sendPredictionRequest = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await fetch('https://via-predictiva-tagname.onrender.com/predecir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json() as PredictionResponse;
  } catch (error) {
    console.error('Error calling prediction API:', error);
    throw error;
  }
};