import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import FireMap from './components/FireMap';
import './App.css';
import TrendChart from './components/TrendChart';
import ChatBot from './components/ChatBot';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Watchlist from './components/Watchlist';

function App() {
  const [fires, setFires] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const watchlistRef = useRef(null);
  const overviewRef = useRef(null);
  const chartRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/fires')
        .then((response) => {
          setFires(response.data);
          setLoading(false);
          setLastUpdated(new Date().toLocaleTimeString());
        })
        .catch((error) => {
          console.error('Error fetching fires:', error);
          setLoading(false);
        });

      axios.get('http://localhost:5000/api/fires/risk-zones')
        .then((response) => {
          setRiskZones(response.data);
        })
        .catch((error) => {
          console.error('Error fetching risk zones:', error);
        });
    };

    fetchData(); // fetch immediately on page load

    const interval = setInterval(fetchData, 5 * 60 * 1000); // repeat every 5 minutes

    return () => clearInterval(interval); // cleanup when component unmounts
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setShowLanding(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return <div className="loading-screen">CONNECTING TO SATELLITE FEED...</div>;
  }

  if (showLanding) {
    return <LandingPage onEnter={() => {
      window.history.pushState({ page: 'dashboard' }, '');
      setShowLanding(false);
    }} />;
  }

  if (!user) {
    return <Auth onLoginSuccess={setUser} />;
  }

  return (
    <div className="app">
      <Header
        totalFires={fires.length}
        lastUpdated={lastUpdated}
        user={user}
        onLogout={handleLogout}
        onGoHome={() => setShowLanding(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="main-content">
        <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
          <nav className="sidebar-nav">
            <button onClick={() => scrollToSection(watchlistRef)}>My Watchlist</button>
            <button onClick={() => scrollToSection(overviewRef)}>Active Detections</button>
            <button onClick={() => scrollToSection(chartRef)}>Trend Chart</button>
          </nav>

          <div className="sidebar-content">
            <div ref={watchlistRef} className="sidebar-section">
              <Watchlist onSelectRegion={setSelectedRegion} />
            </div>
            <div ref={overviewRef} className="sidebar-section">
              <StatsPanel fires={fires} />
            </div>
            <div ref={chartRef} className="sidebar-section">
              <TrendChart fires={fires} />
            </div>
          </div>
        </aside>
        <div className="map-area">
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
          <FireMap fires={fires} riskZones={riskZones} flyToRegion={selectedRegion} />
        </div>
      </div>
      <ChatBot />
    </div>
  );
}

export default App;