function Methodology({ onBack }) {
  return (
    <div className="methodology-page">
      <div className="methodology-hero">
        <div className="methodology-hero-inner">
          <button className="methodology-back" onClick={onBack}>← Back to Dashboard</button>
          <span className="landing-eyebrow">METHODOLOGY</span>
          <h1 className="methodology-title">How This System Works</h1>
          <p className="methodology-intro">
            A technical overview of the data sources, processing pipeline, and spatial
            analysis methods used in this wildfire monitoring system.
          </p>
        </div>
      </div>

      <div className="methodology-container">
        <section className="method-section">
          <span className="method-num">01</span>
          <h2>Data Source</h2>
          <p>
            Fire detections are sourced from NASA's FIRMS (Fire Information for Resource
            Management System) API, which distributes near-real-time and archival active-fire
            data from two satellite sensor families:
          </p>
          <ul>
            <li><strong>VIIRS (Visible Infrared Imaging Radiometer Suite)</strong> — aboard the NOAA-20 satellite, providing 375m resolution detections, used for near-real-time data (last 60 days).</li>
            <li><strong>MODIS (Moderate Resolution Imaging Spectroradiometer)</strong> — aboard the Terra and Aqua satellites, providing 1km resolution detections, used for historical archive queries extending back to November 2000.</li>
          </ul>
          <p>
            Each detection record includes latitude, longitude, brightness temperature (Kelvin),
            acquisition date/time, satellite source, and a confidence classification (low, nominal, high)
            assigned by NASA's detection algorithm.
          </p>
        </section>

        <section className="method-section">
          <span className="method-num">02</span>
          <h2>Data Pipeline</h2>
          <p>
            A scheduled job queries the FIRMS Area API for a bounding box covering Pakistan
            (60.5°E–77.5°E, 23.5°N–37.5°N) at a configurable interval. Retrieved CSV records are
            parsed, transformed into GeoJSON Point geometry, and persisted to a MongoDB collection
            indexed with a <code>2dsphere</code> spatial index — enabling efficient location-based
            queries (e.g. "all detections within X km of point Y").
          </p>
        </section>

        <section className="method-section">
          <span className="method-num">03</span>
          <h2>Spatial Clustering — Risk Zone Detection</h2>
          <p>
            To identify areas of concentrated fire activity, this system implements a custom
            density-based clustering algorithm rather than relying on a third-party GIS library.
            The method proceeds as follows:
          </p>

          <div className="method-formula">
            <strong>Step 1 — Pairwise Distance (Haversine Formula)</strong>
            <p>For any two coordinate pairs, great-circle distance is computed as:</p>
            <pre>{`a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
c = 2 · atan2(√a, √(1−a))
d = R · c   (R = 6371 km, Earth's mean radius)`}</pre>
          </div>

          <div className="method-formula">
            <strong>Step 2 — Cluster Assignment</strong>
            <p>
              Each unvisited detection is treated as a cluster seed. Every other detection within
              a 15km radius (determined via the Haversine distance above) is assigned to that cluster
              and marked visited. This is a single-pass, radius-based grouping — a simplified variant
              of density-based clustering (comparable in spirit to DBSCAN, without the minPts/noise-point
              distinction).
            </p>
          </div>

          <div className="method-formula">
            <strong>Step 3 — Risk Classification</strong>
            <p>Clusters with 3 or more member detections are surfaced as risk zones, classified by size:</p>
            <ul>
              <li><strong>Moderate</strong> — 3–4 detections</li>
              <li><strong>High</strong> — 5–7 detections</li>
              <li><strong>Severe</strong> — 8+ detections</li>
            </ul>
          </div>
        </section>

        <section className="method-section">
          <span className="method-num">04</span>
          <h2>Limitations</h2>
          <ul>
            <li>Satellite fire detection has inherent constraints: cloud cover, smoke, and canopy cover can obscure active fires from thermal sensors.</li>
            <li>MODIS's coarser 1km resolution may miss smaller fires that VIIRS (375m) would detect, so pre-2017 historical comparisons should be treated as conservative estimates.</li>
            <li>The clustering radius (15km) is a fixed parameter; it is not adaptively tuned to local fire density or terrain.</li>
          </ul>
        </section>

        <section className="method-section">
          <span className="method-num">05</span>
          <h2>Tech Stack</h2>
          <p>
            React (Vite) · Node.js / Express · MongoDB with geospatial indexing · Leaflet.js for
            mapping · Chart.js for time-series visualization · JWT authentication · Groq-hosted
            LLM for natural-language data queries.
          </p>
        </section>

        <p className="methodology-footnote">
          Built as an applied GIS &amp; Remote Sensing project, demonstrating satellite-derived
          earth observation data integrated into a full-stack monitoring system.
        </p>
      </div>
    </div>
  );
}

export default Methodology;