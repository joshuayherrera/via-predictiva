// src/components/BarChartModalities.tsx
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
import type { ModalityDataPoint } from '../services/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartModalitiesProps {
  data: ModalityDataPoint[];
  title?: string;
}

const BarChartModalities: React.FC<BarChartModalitiesProps> = ({ 
  data, 
  title = "Accidentes por Modalidad" 
}) => {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No hay datos de modalidades disponibles.</p>;
  }

  // Define beautiful gradient colors for each modality
  const modalityColors = [
    {
      background: 'rgba(255, 99, 132, 0.8)',
      border: 'rgba(255, 99, 132, 1)',
      hover: 'rgba(255, 99, 132, 0.9)'
    },
    {
      background: 'rgba(54, 162, 235, 0.8)',
      border: 'rgba(54, 162, 235, 1)',
      hover: 'rgba(54, 162, 235, 0.9)'
    },
    {
      background: 'rgba(255, 206, 86, 0.8)',
      border: 'rgba(255, 206, 86, 1)',
      hover: 'rgba(255, 206, 86, 0.9)'
    },
    {
      background: 'rgba(75, 192, 192, 0.8)',
      border: 'rgba(75, 192, 192, 1)',
      hover: 'rgba(75, 192, 192, 0.9)'
    },
    {
      background: 'rgba(153, 102, 255, 0.8)',
      border: 'rgba(153, 102, 255, 1)',
      hover: 'rgba(153, 102, 255, 0.9)'
    },
    {
      background: 'rgba(255, 159, 64, 0.8)',
      border: 'rgba(255, 159, 64, 1)',
      hover: 'rgba(255, 159, 64, 0.9)'
    }
  ];

  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(point => point.modalidad),
    datasets: [
      {
        label: 'Cantidad de Accidentes',
        data: data.map(point => point.count),
        backgroundColor: data.map((_, index) => 
          modalityColors[index % modalityColors.length].background
        ),
        borderColor: data.map((_, index) => 
          modalityColors[index % modalityColors.length].border
        ),
        hoverBackgroundColor: data.map((_, index) => 
          modalityColors[index % modalityColors.length].hover
        ),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we have labels on x-axis
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
            return `Cantidad: ${context.parsed.y} accidentes`;
          },
          title: function(context: any) {
            return `Modalidad: ${context[0].label}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tipo de Modalidad',
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
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: false // Clean look without vertical grid lines
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Accidentes',
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
          stepSize: 1, // Show integer values only
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        }
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutCubic' as const,
      delay: (context: any) => {
        return context.dataIndex * 100; // Stagger animation for each bar
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      bar: {
        borderRadius: 6,
      }
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
        {/* @ts-ignore */}
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChartModalities;
