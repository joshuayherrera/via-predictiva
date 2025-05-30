import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Existing API functions
export const fetchPrediction = (lat: number, lng: number, hora: number | string) =>
  API.get(`/predict?lat=${lat}&lng=${lng}&hora=${hora}`);

export const fetchHistory = (lat: number, lng: number) =>
  API.get(`/history?lat=${lat}&lng=${lng}`);

// Nueva interfaz de solicitud que coincide con el body requerido
export interface PredictionRequest {
  LATITUD: number;
  LONGITUD: number;
  TIPO_DE_VIA: string;
  RED_VIAL: string;
  DEPARTAMENTO: string;
  PROVINCIA: string;
  DISTRITO: string;
}

// Nueva interfaz de respuesta basada en la estructura actualizada
export interface PredictionResponse {
  Entrada: {
    LATITUD: string;
    LONGITUD: string;
    TIPO_DE_VIA: string;
    RED_VIAL: string;
    DEPARTAMENTO: string;
    PROVINCIA: string;
    DISTRITO: string;
    HORA: number;
  };
  PREDICCION: {
    SEVERIDAD: string;
    PROBABILIDAD: string;
    PROBABILIDADES: {
      ALTA: string;
      BAJA: string;
    };
  };
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

// Nueva interfaz para la respuesta de horarios
export interface HourlyPredictionResponse {
  DISTRITO: string;
  PROBABILIDADES_HORAS: {
    [hour: string]: number;
  };
}

// Nueva función para obtener predicciones horarias
export const fetchHourlyPredictions = async (distrito: string): Promise<HourlyPredictionResponse> => {
  try {
    const response = await fetch('https://via-predictiva-tagname.onrender.com/predecir/horarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        DISTRITO: distrito
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json() as HourlyPredictionResponse;
  } catch (error) {
    console.error('Error calling hourly prediction API:', error);
    throw error;
  }
};