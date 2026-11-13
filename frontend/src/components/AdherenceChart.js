import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import './AdherenceChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdherenceChart = ({ last7Days, last30Days }) => {
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState('7'); // '7' or '30'
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  const legendColor = isDark ? '#e2e8f0' : '#0f172a';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const yTitleColor = isDark ? '#cbd5e1' : '#334155';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
  const tooltipTitle = isDark ? '#38bdf8' : '#0284c7';
  const tooltipBody = isDark ? '#f8fafc' : '#0f172a';
  const tooltipBorder = isDark ? 'rgba(14, 165, 233, 0.4)' : '#e2e8f0';

  const activeData = timeframe === '7' ? last7Days : last30Days;

  if (!activeData || !activeData.labels || activeData.labels.length === 0) {
    return (
      <div className="adherence-chart-empty">
        <p>No adherence data available for visualization.</p>
      </div>
    );
  }

  // Adjust dataset styling if line chart
  const formattedData = {
    ...activeData,
    datasets: activeData.datasets.map((ds) => ({
      ...ds,
      tension: 0.3,
      fill: chartType === 'line' ? false : undefined,
      pointRadius: chartType === 'line' ? 4 : undefined,
      pointHoverRadius: chartType === 'line' ? 6 : undefined,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          color: legendColor,
          font: {
            family: "'Plus Jakarta Sans', -apple-system, sans-serif",
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: '700' },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          stepSize: 1,
          color: tickColor,
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Number of Doses',
          color: yTitleColor,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
            weight: '600',
          },
        },
      },
    },
  };

  return (
    <div className="adherence-chart-wrapper">
      <div className="chart-controls">
        <div className="control-group">
          <label>Timeframe:</label>
          <div className="btn-toggle-group">
            <button
              className={`toggle-btn ${timeframe === '7' ? 'active' : ''}`}
              onClick={() => setTimeframe('7')}
            >
              Last 7 Days
            </button>
            <button
              className={`toggle-btn ${timeframe === '30' ? 'active' : ''}`}
              onClick={() => setTimeframe('30')}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>View:</label>
          <div className="btn-toggle-group">
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
            <button
              className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <div className="chart-canvas-container">
        {chartType === 'bar' ? (
          <Bar data={formattedData} options={options} />
        ) : (
          <Line data={formattedData} options={options} />
        )}
      </div>
    </div>
  );
};

export default AdherenceChart;
