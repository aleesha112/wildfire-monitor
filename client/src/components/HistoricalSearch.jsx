import { useState } from 'react';
import axios from 'axios';

function HistoricalSearch({ onResults }) {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = async () => {
    if (!date) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fires/historical?date=${date}`);
      if (res.data.count === 0) {
        setError(`No fire detections found for ${date}.`);
      }
      onResults(res.data.fires, date);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data for this date');
      // Don't call onResults here — keep whatever was on screen, just show the error
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDate('');
    setError('');
    onResults(null, null);
  };

  return (
    <div className="historical-search">
      <span className="panel-title">VIEW BY DATE</span>
      <div className="historical-controls">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleSearch} disabled={!date || loading}>
          {loading ? '...' : 'View'}
        </button>
        {date && (
          <button className="historical-reset" onClick={handleReset}>
            Live
          </button>
        )}
      </div>
      {error && <p className="historical-error">{error}</p>}
    </div>
  );
}

export default HistoricalSearch;