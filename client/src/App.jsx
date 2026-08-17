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
import HistoricalSearch from './components/HistoricalSearch';
import TimelapseSlider from './components/TimelapseSlider';
import Methodology from './components/Methodology';

function App() {
  const [fires, setFires] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showMethodology, setShowMethodology] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser || savedUser === 'undefined') return null;
      return JSON.parse(savedUser);
    } catch (e) {
      return null;
    }
  });
  const watchlistRef = useRef(null);
  const overviewRef = useRef(null);
  const chartRef = useRef(null);
  const historicalRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historicalFires, setHistoricalFires] = useState(null);
  const [historicalDate, setHistoricalDate] = useState(null);
  const [timelapseActive, setTimelapseActive] = useState(false);
  const [timelapseFires, setTimelapseFires] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchLiveData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/fires`)
      .then((response) => {
        setFires(response.data);
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((error) => {
        console.error('Error fetching fires:', error);
        setLoading(false);
      });

    axios.get(`${import.meta.env.VITE_API_URL}/api/fires/risk-zones`)
      .then((response) => {
        setRiskZones(response.data);
      })
      .catch((error) => {
        console.error('Error fetching risk zones:', error);
      });
  };

  const handleHistoricalResults = (fires, date) => {
    setHistoricalFires(fires);
    setHistoricalDate(date);

    if (!fires && !date) {
      fetchLiveData();
    }
  };

  const handleTimelapseFilter = (filteredFires) => {
    setTimelapseFires(filteredFires);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  if (showMethodology) {
    return <Methodology onBack={() => setShowMethodology(false)} />;
  }

  const displayFires = timelapseActive ? (timelapseFires || []) : (historicalFires || fires);

  return (
    <div className="app">
      <Header
        totalFires={displayFires.length}
        lastUpdated={lastUpdated}
        user={user}
        onLogout={handleLogout}
        onGoHome={() => setShowLanding(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        timelapseActive={timelapseActive}
        onToggleTimelapse={() => setTimelapseActive(!timelapseActive)}
        onShowMethodology={() => setShowMethodology(true)}
      />
      <div className="main-content">
        <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
          <nav className="sidebar-nav">
            <button onClick={() => scrollToSection(watchlistRef)}>My Watchlist</button>
            <button onClick={() => scrollToSection(overviewRef)}>Active Detections</button>
            <button onClick={() => scrollToSection(chartRef)}>Trend Chart</button>
            <button onClick={() => scrollToSection(historicalRef)}>View by Date</button>
          </nav>

          <div className="sidebar-content">
            <div ref={watchlistRef} className="sidebar-section">
              <Watchlist onSelectRegion={setSelectedRegion} />
            </div>
            <div ref={overviewRef} className="sidebar-section">
              <StatsPanel fires={displayFires} />
            </div>
            <div ref={chartRef} className="sidebar-section">
              <TrendChart fires={displayFires} />
            </div>
            <div ref={historicalRef} className="sidebar-section">
              <HistoricalSearch onResults={handleHistoricalResults} />
            </div>
          </div>
        </aside>
        <div className="map-area">
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
          {timelapseActive && (
            <TimelapseSlider
              allFires={fires}
              onFilteredFires={handleTimelapseFilter}
              onExit={() => setTimelapseActive(false)}
            />
          )}
          <FireMap
            fires={displayFires}
            riskZones={riskZones}
            flyToRegion={selectedRegion}
            isHistorical={!!historicalDate}
            historicalDate={historicalDate}
          />
        </div>
      </div>
      <ChatBot />
    </div>
  );
}

export default App;