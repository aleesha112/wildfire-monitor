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
      <section className="landing-science">
        <div className="science-content">
          <span className="landing-eyebrow">THE SCIENCE</span>
          <h2 className="science-title">How a satellite sees a wildfire</h2>
          <p className="science-intro">
            This platform runs on real data from NASA's VIIRS instrument — the same
            remote sensing technology used by environmental agencies worldwide.
          </p>

          <div className="science-rows">
            <div className="science-row">
              <div className="science-row-image">
                <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&q=80" alt="Satellite orbiting Earth" />
              </div>
              <div className="science-row-text">
                <span className="science-num">01</span>
                <h3>Thermal Sensing</h3>
                <p>VIIRS orbits Earth twice daily, scanning the surface in infrared. Active fires radiate heat far above their surroundings, making them detectable even through smoke.</p>
              </div>
            </div>

            <div className="science-row reverse">
              <div className="science-row-image">
                <img src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&q=80" alt="Earth at night showing thermal lights" />
              </div>
              <div className="science-row-text">
                <span className="science-num">02</span>
                <h3>Brightness Temperature</h3>
                <p>Each detection carries a brightness value in Kelvin — a direct read of the fire's radiative intensity, used to gauge how severe an active fire is.</p>
              </div>
            </div>

            <div className="science-row">
              <div className="science-row-image">
                <img src="https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=600&q=80" alt="Infrared thermal imaging technology" />
              </div>
              <div className="science-row-text">
                <span className="science-num">03</span>
                <h3>Confidence Classification</h3>
                <p>Every hotspot is scored low, nominal, or high confidence, based on how certain the sensor is that it's an active fire rather than a false positive like a sunglint or hot surface.</p>
              </div>
            </div>

            <div className="science-row reverse">
              <div className="science-row-image">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80" alt="Polar-orbiting satellite platform" />
              </div>
              <div className="science-row-text">
                <span className="science-num">04</span>
                <h3>Spatial Clustering</h3>
                <p>This dashboard applies geospatial analysis — the Haversine formula — to group nearby detections into risk zones, revealing patterns a single data point can't show.</p>
              </div>
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