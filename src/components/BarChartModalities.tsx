// src/components/BarChartModalities.tsx
import React from 'react';
import type { ModalityDataPoint } from '../services/data';

interface BarChartModalitiesProps {
  data: ModalityDataPoint[];
}

const BarChartModalities: React.FC<BarChartModalitiesProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de modalidades disponibles.</p>;
  }
  
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Accidentes por Modalidad</h4>
      <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        {data.map((point) => (
          <div key={point.modalidad} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '100px', fontSize: '0.9em', color: '#555' }}>{point.modalidad}: </span>
            <div style={{ flexGrow: 1, backgroundColor: '#efefef', borderRadius: '3px' }}>
              <div style={{ 
                width: `${(point.count / maxCount) * 100}%`, 
                backgroundColor: 'rgba(255, 99, 132, 0.6)', 
                height: '22px', 
                color: 'white', 
                paddingLeft: '8px', 
                lineHeight: '22px', 
                fontSize: '0.85em',
                borderRadius: '3px',
                border: '1px solid rgba(255, 99, 132, 1)',
                minWidth: '25px', // Ensure count is visible even for small values
                textAlign: 'right',
                paddingRight: '5px'
              }}>
                {point.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChartModalities;
