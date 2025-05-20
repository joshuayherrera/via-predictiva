// src/components/TimeSeriesChart.tsx
import React from 'react';
import type { TimeSeriesDataPoint } from '../services/data';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de series temporales disponibles.</p>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero

  return (
    <div style={{ marginTop: '15px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Predicción Horaria de Accidentes</h4>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        {data.map((point) => (
          <div
            key={point.hora}
            title={`Hora: ${String(point.hora).padStart(2, '0')}:00, Cantidad: ${point.count}`}
            style={{
              width: `${100 / data.length}%`,
              height: `${(point.count / maxCount) * 100}%`,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              margin: '0 1px',
              textAlign: 'center',
              fontSize: '10px',
              color: '#333',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              overflow: 'hidden',
              borderTop: '2px solid rgba(75, 192, 192, 1)',
            }}
          >
            <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', whiteSpace: 'nowrap', paddingBottom: '3px' }}>
              {String(point.hora).padStart(2, '0')}h ({point.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSeriesChart;
