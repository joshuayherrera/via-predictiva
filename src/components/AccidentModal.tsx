// src/components/AccidentModal.tsx
import React from 'react';
import type { MockPrediction, MockHistoryData } from '../services/data';
import TimeSeriesChart from './TimeSeriesChart';
import BarChartModalities from './BarChartModalities';

interface AccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: MockPrediction | null;
  historyData: MockHistoryData | null;
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  zIndex: 1000,
  width: '90%',
  maxWidth: '650px',
  maxHeight: '90vh',
  overflowY: 'auto',
  fontFamily: 'Arial, sans-serif',
};

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  zIndex: 999,
};

const getRiskColor = (risk: number): string => {
  if (risk > 0.7) return '#d32f2f'; // Red
  if (risk > 0.4) return '#ffa000'; // Orange
  return '#388e3c'; // Green
};

const getRiskLevelText = (risk: number): string => {
  if (risk > 0.7) return 'Alto';
  if (risk > 0.4) return 'Medio';
  return 'Bajo';
};

const AccidentModal: React.FC<AccidentModalProps> = ({ isOpen, onClose, prediction, historyData }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={modalStyle}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none', 
            border: 'none', 
            fontSize: '1.8rem', 
            cursor: 'pointer',
            color: '#777'
          }}
        >
          &times;
        </button>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Análisis de Riesgo de Accidente
        </h2>
        
        {prediction ? (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <p><strong>Ubicación:</strong> Lat: {prediction.lat.toFixed(5)}, Lng: {prediction.lng.toFixed(5)}</p>
            <p><strong>Dirección Estimada:</strong> {prediction.address || 'No disponible'}</p>
            <p style={{ marginTop: '10px' }}>
              <strong>Nivel de Riesgo: </strong> 
              <span style={{ 
                color: getRiskColor(prediction.risk), 
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: getRiskColor(prediction.risk) + '20' // Light background tint
              }}>
                {prediction.risk.toFixed(2)} ({getRiskLevelText(prediction.risk)})
              </span>
            </p>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de predicción para el punto seleccionado.</p>
        )}

        {historyData ? (
          <>
            <TimeSeriesChart data={historyData.timeSeries} />
            <BarChartModalities data={historyData.modalities} />
          </>
        ) : (
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
    </>
  );
};

export default AccidentModal;
