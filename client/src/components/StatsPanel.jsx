function StatsPanel({ fires }) {
  const total = fires.length;
  const highConfidence = fires.filter(f => f.confidence === 'h').length;
  const avgBrightness = total > 0
    ? (fires.reduce((sum, f) => sum + (f.brightness || 0), 0) / total).toFixed(1)
    : 0;

  // Gauge calculation: how "full" the arc is, based on detections (capped at 100 for visual scale)
  const gaugePercent = Math.min((total / 100) * 100, 100);
  const angle = (gaugePercent / 100) * 180; // semi-circle = 180 degrees

  return (
    <div className="stats-panel">
      <span className="panel-title">ACTIVE DETECTIONS</span>

      <div className="gauge-wrap">
        <svg viewBox="0 0 200 110" className="gauge-svg">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#eee8e4"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#7a1f1f"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 251} 251`}
          />
        </svg>
        <div className="gauge-value">
          <span className="gauge-number">{total}</span>
          <span className="gauge-sub">detections</span>
        </div>
      </div>

      <div className="mini-stats-row">
        <div className="mini-stat">
          <span className="mini-stat-number danger">{highConfidence}</span>
          <span className="mini-stat-label">HIGH CONFIDENCE</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{avgBrightness}K</span>
          <span className="mini-stat-label">AVG BRIGHTNESS</span>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="dot red"></span> High Confidence</div>
        <div className="legend-item"><span className="dot orange"></span> Nominal</div>
        <div className="legend-item"><span className="dot yellow"></span> Low Confidence</div>
      </div>
    </div>
  );
}

export default StatsPanel;