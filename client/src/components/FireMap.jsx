import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const MAP_THEMES = {
  light: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors'
  }
};

function FlyToRegion({ region, fires }) {
  const map = useMap();

  useEffect(() => {
    if (!region) return;

    map.flyTo([region.latitude, region.longitude], 10, { duration: 1.5 });

    // Haversine formula to calculate real distance in km
    const getDistanceKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const radius = region.radiusKm || 20;
    const nearbyFires = fires.filter(
      (f) => getDistanceKm(region.latitude, region.longitude, f.latitude, f.longitude) <= radius
    );

    const message = nearbyFires.length > 0
      ? `🔥 ${nearbyFires.length} fire detection(s) found within ${radius}km`
      : `✅ No active fires detected within ${radius}km`;

    // Wait for the flyTo animation to finish, then show the popup
    const timer = setTimeout(() => {
      L.popup()
        .setLatLng([region.latitude, region.longitude])
        .setContent(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:12px;">
            <strong>${region.regionName}</strong><br/>${message}
          </div>`
        )
        .openOn(map);
    }, 1600);

    return () => clearTimeout(timer);
  }, [region, fires, map]);

  return null;
}

function FireMap({ fires, riskZones, flyToRegion }){
  const [theme, setTheme] = useState('light');
  const [pakistanBoundary, setPakistanBoundary] = useState(null);

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/PAK.geo.json')
      .then((response) => {
        setPakistanBoundary(response.data);
      })
      .catch((error) => console.error('Error loading boundary:', error));
  }, []);

  const getColor = (confidence) => {
    if (confidence === 'h') return '#ff4d4d';
    if (confidence === 'n') return '#ff9d42';
    return '#ffd166';
  };

  return (
    <div className="map-wrapper">
      <div className="theme-switcher">
        {Object.keys(MAP_THEMES).map((key) => (
          <button
            key={key}
            className={theme === key ? 'theme-btn active' : 'theme-btn'}
            onClick={() => setTheme(key)}
          >
            {MAP_THEMES[key].name}
          </button>
        ))}
      </div>

      <MapContainer
        center={[30.3753, 69.3451]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={theme}
          url={MAP_THEMES[theme].url}
          attribution={MAP_THEMES[theme].attribution}
        />
        <FlyToRegion region={flyToRegion} fires={fires} />

        {pakistanBoundary && (
          <GeoJSON
            data={pakistanBoundary}
            style={{
              color: '#ff9d42',
              weight: 2,
              fillColor: '#ff9d42',
              fillOpacity: 0.03,
              dashArray: '4, 4'
            }}
          />
        )}
        {riskZones.map((zone, index) => {
  const zoneColor = zone.riskLevel === 'severe' ? '#8B1E1E'
  : zone.riskLevel === 'high' ? '#C9622A'
  : '#D9A441';

  return (
    <Circle
      key={`zone-${index}`}
      center={[zone.centerLat, zone.centerLon]}
      radius={15000}
      pathOptions={{
        color: zoneColor,
        fillColor: zoneColor,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6'
      }}
    >
      <Popup>
        <div>
          <strong>⚠️ {zone.riskLevel.toUpperCase()} RISK ZONE</strong><br />
          Fires in cluster: {zone.fireCount}<br />
          Radius: ~15km
        </div>
      </Popup>
    </Circle>
  );
})}

        {fires.map((fire) => (
          <CircleMarker
            key={fire._id}
            center={[fire.latitude, fire.longitude]}
            radius={6}
            pathOptions={{
              color: getColor(fire.confidence),
              fillColor: getColor(fire.confidence),
              fillOpacity: 0.7,
              weight: 1
            }}
          >
            <Popup>
              <div>
                <strong>🔥 Fire Detected</strong><br />
                Date: {fire.acquiredDate}<br />
                Time: {fire.acquiredTime}<br />
                Brightness: {fire.brightness}K<br />
                Confidence: {fire.confidence}<br />
                Satellite: {fire.satellite}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FireMap;