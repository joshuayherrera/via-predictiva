// src/components/TimeSeriesChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { TimeSeriesDataPoint } from '../services/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title = "Predicción Horaria de Accidentes" 
}) => {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de series temporales disponibles.</p>;
  }

  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(point => `${String(point.hora).padStart(2, '0')}:00`),
    datasets: [
      {
        label: data[0].probability !== undefined ? 'Probabilidad (%)' : 'Cantidad de Accidentes',
        data: data.map(point => data[0].probability !== undefined ? 
          (point.probability! * 100).toFixed(2) : point.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          },
          color: '#333'
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
          family: 'Arial, sans-serif'
        },
        color: '#333',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataPoint = data[context.dataIndex];
            if (dataPoint.probability !== undefined) {
              return `Probabilidad: ${(dataPoint.probability * 100).toFixed(2)}%`;
            } else {
              return `Cantidad: ${dataPoint.count}`;
            }
          },
          title: function(context: any) {
            const dataPoint = data[context[0].dataIndex];
            return `Hora: ${String(dataPoint.hora).padStart(2, '0')}:00`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hora del Día',
          font: {
            size: 14,
            weight: 'bold' as const,
            family: 'Arial, sans-serif'
          },
          color: '#555'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#666',
          maxRotation: 45
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: data[0].probability !== undefined ? 'Probabilidad (%)' : 'Cantidad',
          font: {
            size: 14,
            weight: 'bold' as const,
            family: 'Arial, sans-serif'
          },
          color: '#555'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#666',
          callback: function(value: any) {
            if (data[0].probability !== undefined) {
              return value + '%';
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <div style={{ 
      marginTop: '15px', 
      padding: '15px', 
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{ height: '300px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimeSeriesChart;
