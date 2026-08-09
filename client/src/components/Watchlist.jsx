import { useState, useEffect } from 'react';
import axios from 'axios';

function Watchlist({ onSelectRegion }) {
  const [items, setItems] = useState([]);
  const [regionName, setRegionName] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchWatchlist = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/watchlist`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Error fetching watchlist:', err));
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const addRegion = async (e) => {
    e.preventDefault();
    if (!regionName.trim()) return;

    setLoading(true);
    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(regionName + ', Pakistan')}&format=json&limit=1`
      );

      if (geoRes.data.length === 0) {
        alert('Region not found. Try a different name.');
        setLoading(false);
        return;
      }

      const { lat, lon } = geoRes.data[0];

      const saveRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/watchlist`,
        { regionName, latitude: parseFloat(lat), longitude: parseFloat(lon), radiusKm: 20 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRegionName('');
      fetchWatchlist();

      // Immediately zoom to the newly added region
      onSelectRegion(saveRes.data);

    } catch (error) {
      console.error('Error adding region:', error);
      alert('Failed to add region');
    } finally {
      setLoading(false);
    }
  };

  const removeRegion = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/watchlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing region:', error);
    }
  };

  return (
    <div className="watchlist-panel">
      <span className="panel-title">MY WATCHLIST</span>

      <form className="watchlist-form" onSubmit={addRegion}>
        <input
          type="text"
          placeholder="e.g. Chitral, Murree..."
          value={regionName}
          onChange={(e) => setRegionName(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>{loading ? '...' : 'Add'}</button>
      </form>

      <div className="watchlist-items">
        {items.length === 0 && (
          <p className="watchlist-empty">No regions added yet.</p>
        )}
        {items.map((item) => (
          <div key={item._id} className="watchlist-item" onClick={() => onSelectRegion(item)}>
            <div>
              <span className="watchlist-name">{item.regionName}</span>
              <span className="watchlist-radius">{item.radiusKm}km radius</span>
            </div>
            <button
              className="watchlist-remove"
              onClick={(e) => { e.stopPropagation(); removeRegion(item._id); }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;