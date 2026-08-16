function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="ember-field">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="ember" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }}></span>
          ))}
        </div>

        <div className="radar-pulse"></div>

        <nav className="landing-nav">
          <span className="landing-logo">WILDFIRE<em>MONITOR</em></span>
          <button className="landing-nav-btn" onClick={onEnter}>Sign In</button>
        </nav>

        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            <span className="live-dot"></span> LIVE SATELLITE MONITORING
          </span>
          <h1 className="landing-title">
            Pakistan's wildfires,<br /><em>tracked from space.</em>
          </h1>
          <p className="landing-subtitle">
            Real-time fire detection powered by NASA VIIRS satellite data.
            Spatial risk analysis, historical trends, and AI-assisted insight —
            built for a country where every season brings new fire risk.
          </p>
          <button className="landing-cta" onClick={onEnter}>
            Enter Dashboard →
          </button>
        </div>
      </section>
      <section className="landing-gallery">
        <div className="gallery-content">
          <span className="landing-eyebrow gallery-eyebrow">EARTH OBSERVATION</span>
          <h2 className="science-title">Seeing wildfires the way satellites do</h2>
          <div className="gallery-grid">
            <div className="gallery-item large">
              <img src="https://media.istockphoto.com/id/1135995821/photo/satellite-observation-of-north-pole.jpg?s=612x612&w=0&k=20&c=5isPHmBR9cF51N050wLqB6FM3kOcF45D7eAAL1XIvSs=" alt="Satellite view of Earth" />
              <span className="gallery-caption">Earth observation from orbit</span>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=500&q=80" alt="Earth at night showing fire lights" />
              <span className="gallery-caption">Thermal signatures at night</span>
            </div>
            <div className="gallery-item">
              <img src="https://plus.unsplash.com/premium_photo-1714618982739-a48bdef8a73b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG9sYXIlMjBvcmJpdGluZyUyMHNhdGVsbGl0fGVufDB8fDB8fHww" alt="Satellite in orbit" />
              <span className="gallery-caption">Polar-orbiting satellite</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="landing-science">
        <div className="science-content">
          <span className="landing-eyebrow">THE SCIENCE</span>
          <h2 className="science-title">How a satellite sees a wildfire</h2>
          <p className="science-intro">
            This platform runs on real data from NASA's VIIRS instrument — the same
            remote sensing technology used by environmental agencies worldwide.
          </p>

          <div className="science-steps">
            <div className="science-step">
              <span className="science-num">01</span>
              <h3>Thermal Sensing</h3>
              <p>VIIRS orbits Earth twice daily, scanning the surface in infrared. Active fires radiate heat far above their surroundings, making them detectable even through smoke.</p>
            </div>
            <div className="science-step">
              <span className="science-num">02</span>
              <h3>Brightness Temperature</h3>
              <p>Each detection carries a brightness value in Kelvin — a direct read of the fire's radiative intensity, used to gauge how severe an active fire is.</p>
            </div>
            <div className="science-step">
              <span className="science-num">03</span>
              <h3>Confidence Classification</h3>
              <p>Every hotspot is scored low, nominal, or high confidence, based on how certain the sensor is that it's an active fire rather than a false positive like a sunglint or hot surface.</p>
            </div>
            <div className="science-step">
              <span className="science-num">04</span>
              <h3>Spatial Clustering</h3>
              <p>This dashboard applies geospatial analysis — the Haversine formula — to group nearby detections into risk zones, revealing patterns a single data point can't show.</p>
            </div>
          </div>

          <p className="science-footnote">
            Built as an applied GIS &amp; Remote Sensing project — combining satellite-derived
            earth observation data with a full-stack monitoring system.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-ember-field">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="ember" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }}></span>
          ))}
        </div>
        <p className="footer-tagline">Wildfire Monitor — GIS &amp; Remote Sensing Project</p>
        <p className="footer-rights">© 2026 All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;