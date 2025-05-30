import React, { useEffect, useState } from 'react';
import type { MockPrediction, MockHistoryData, TimeSeriesDataPoint } from '../services/data';
import { fetchHourlyPredictions, type HourlyPredictionResponse } from '../services/api';
import { transformHourlyPredictionResponse } from '../services/data';
import BarChartModalities from './BarChartModalities';
import TimeSeriesChart from './TimeSeriesChart';

interface AccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: MockPrediction | null;
  historyData: MockHistoryData | null;
  isLoading?: boolean;
  error?: string | null;
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '95px', 
  left: '10px',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  zIndex: 1000,
  width: '450px',
  maxHeight: 'calc(100vh - 90px)', 
  overflowY: 'auto',
  fontFamily: 'Arial, sans-serif',
  border: '2px solid #e0e0e0',
};

// Función para convertir valor de riesgo numérico a color
// Esta función se mantiene por compatibilidad con componentes que aún usan risk
/* @ts-ignore*/
const getRiskColor = (risk: number): string => {
  if (risk > 0.7) return '#d32f2f'; // Red
  if (risk > 0.4) return '#ffa000'; // Orange
  return '#388e3c'; // Green
};

// Función para obtener color basado en severidad textual
const getSeverityColor = (severity: string): string => {
  switch(severity?.toUpperCase()) {
    case 'ALTA': return '#d32f2f'; // Red
    case 'MEDIA': return '#ffa000'; // Orange
    default: return '#388e3c'; // Green (for BAJA or default)
  }
};

const AccidentModal: React.FC<AccidentModalProps> = ({ isOpen, onClose, prediction, historyData, isLoading, error }) => {
  const [hourlyData, setHourlyData] = useState<TimeSeriesDataPoint[] | null>(null);
  const [hourlyLoading, setHourlyLoading] = useState(false);
  const [hourlyError, setHourlyError] = useState<string | null>(null);
  // Fetch hourly predictions when modal opens and prediction is available
  useEffect(() => {
    if (isOpen && prediction?.distrito) {
      const fetchHourlyData = async () => {
        setHourlyLoading(true);
        setHourlyError(null);
        try {
          // Ensure distrito is not undefined
          const distrito = prediction.distrito!;
          const response: HourlyPredictionResponse = await fetchHourlyPredictions(distrito);
          const transformedData = transformHourlyPredictionResponse(response);
          setHourlyData(transformedData);
        } catch (err) {
          console.error('Error fetching hourly predictions:', err);
          setHourlyError('Error al cargar predicciones horarias');
          // Fallback to mock data if API fails
          if (historyData?.timeSeries) {
            setHourlyData(historyData.timeSeries);
          }
        } finally {
          setHourlyLoading(false);
        }
      };

      fetchHourlyData();
    }
  }, [isOpen, prediction?.distrito, historyData?.timeSeries]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHourlyData(null);
      setHourlyError(null);
      setHourlyLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={modalStyle}>
      <button 
        onClick={onClose} 
        style={{ 
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none', 
          border: 'none', 
          fontSize: '1.5rem', 
          cursor: 'pointer',
          color: '#777',
          padding: '0',
          width: '25px',
          height: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        &times;
      </button>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Análisis de Riesgo de Accidente
      </h2>
      
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Cargando predicción...</p>
        </div>
      )}
      
      {error && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>
          <p>{error}</p>
        </div>
      )}
      
      {prediction && !isLoading && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
          <p><strong>Ubicación:</strong> Lat: {prediction.lat.toFixed(5)}, Lng: {prediction.lng.toFixed(5)}</p>
          <p><strong>Dirección Estimada:</strong> {prediction.address || 'No disponible'}</p>
          
          {prediction.typeOfRoad && prediction.roadNetwork && (
            <p><strong>Tipo de Vía:</strong> {prediction.typeOfRoad} - {prediction.roadNetwork}</p>
          )}
          
          {prediction.departamento && (
            <p><strong>Región:</strong> {prediction.departamento}, {prediction.provincia}, {prediction.distrito}</p>
          )}

          {prediction.severity && (
            <p style={{ marginTop: '10px' }}>
              <strong>Severidad Predicha: </strong> 
              <span style={{ 
                color: getSeverityColor(prediction.severity), 
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: getSeverityColor(prediction.severity) + '20' // Light background tint
              }}>
                {prediction.severity}
              </span>
            </p>
          )}

          {prediction.probability && (
            <p><strong>Probabilidad General:</strong> {prediction.probability}</p>
          )}
          
          {(prediction.probabilityHigh || prediction.probabilityLow) && (
            <div style={{ 
              marginTop: '15px',
              border: '1px solid #e0e0e0',
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5'
            }}>
              <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Detalle de Probabilidades:</p>
              {prediction.probabilityHigh && (
                <p style={{ 
                  marginLeft: '10px', 
                  color: getSeverityColor('ALTA'),
                  fontWeight: 'bold'
                }}>
                  Alta: {prediction.probabilityHigh}
                </p>
              )}
              {prediction.probabilityLow && (
                <p style={{ 
                  marginLeft: '10px',
                  color: getSeverityColor('BAJA'),
                  fontWeight: 'bold'
                }}>
                  Baja: {prediction.probabilityLow}
                </p>
              )}
            </div>
          )}
        </div>
      )}      {!prediction && !isLoading && (
        <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de predicción para el punto seleccionado.</p>
      )}      
      {/* Hourly Predictions Chart - Solo se muestra si hay distrito disponible */}
      {prediction?.distrito && (
        <>
          {hourlyLoading && (
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px', marginBottom: '15px' }}>
              <p>Cargando predicciones horarias para {prediction.distrito}...</p>
            </div>
          )}
          
          {hourlyError && (
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '15px' }}>
              <p>{hourlyError}</p>
            </div>
          )}

          {hourlyData && !hourlyLoading && (
            <TimeSeriesChart 
              data={hourlyData} 
              title={`Predicción Horaria - ${prediction.distrito}`}
            />
          )}
        </>
      )}

      {/* Mostrar mensaje cuando no hay distrito disponible */}
      {prediction && !prediction.distrito && (
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '6px', marginBottom: '15px' }}>
          <p>No se pueden cargar predicciones horarias sin información de distrito</p>
        </div>
      )}      {/* Modality Chart - Solo se muestra si hay distrito disponible */}
      {prediction?.distrito && historyData && (
        <BarChartModalities 
          data={historyData.modalities} 
          title={`Modalidades de Accidentes - ${prediction.distrito}`}
        />
      )}

      {/* Mostrar mensaje cuando no hay distrito disponible para modalidades */}
      {prediction && !prediction.distrito && (
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '6px', marginTop: '15px' }}>
          <p>No se pueden cargar datos de modalidades sin información de distrito</p>
        </div>
      )}
      
      {!historyData && !hourlyData && !hourlyLoading && !isLoading && prediction?.distrito && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Cargando datos históricos...</p>
      )}
      
      <button 
        onClick={onClose} 
        style={{ 
          marginTop: '25px', 
          padding: '12px 25px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          fontSize: '1rem'
        }}
      >
        Cerrar
      </button>
    </div>
  );
};

export default AccidentModal;
