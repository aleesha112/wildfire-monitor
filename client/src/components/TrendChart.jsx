import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, zoomPlugin);

function TrendChart({ fires }) {
  const chartRef = useRef(null);
  const countByDate = {};
  fires.forEach((fire) => {
    const date = fire.acquiredDate;
    if (date) {
      countByDate[date] = (countByDate[date] || 0) + 1;
    }
  });

  const sortedDates = Object.keys(countByDate).sort();
  const counts = sortedDates.map((date) => countByDate[date]);

  const data = {
  labels: sortedDates,
  datasets: [
    {
      label: 'Fire Detections',
      data: counts,
      borderColor: '#7a1f1f',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(122, 31, 31, 0.15)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(122, 31, 31, 0.35)');
        gradient.addColorStop(1, 'rgba(122, 31, 31, 0.02)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointBackgroundColor: '#7a1f1f',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
    },
  ],
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1C1815',
        titleColor: '#F5F1EA',
        bodyColor: '#A39B8E',
        borderColor: 'rgba(201, 98, 42, 0.25)',
        borderWidth: 1,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(201, 98, 42, 0.1)' },
        ticks: { color: '#A39B8E', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(201, 98, 42, 0.1)' },
        ticks: { color: '#A39B8E', font: { family: 'JetBrains Mono', size: 10 } },
        beginAtZero: true,
      },
    },
  };

  const resetZoom = (chartRef) => {
    if (chartRef) chartRef.resetZoom();
  };

  return (
    <div className="trend-chart-panel">
      <div className="chart-header">
        <span className="panel-title">FIRE DETECTIONS OVER TIME</span>
        <div className="zoom-controls">
          <button onClick={() => chartRef.current?.zoom(1.2)} title="Zoom In">+</button>
          <button onClick={() => chartRef.current?.zoom(0.8)} title="Zoom Out">−</button>
          <button className="reset-btn" onClick={() => chartRef.current?.resetZoom()} title="Reset">Reset</button>
        </div>
      </div>
      <div className="chart-container">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}

export default TrendChart;