# 🔥 Wildfire Monitor

A production-grade wildfire monitoring platform for Pakistan, built on real NASA satellite data. Developed as an applied GIS & Remote Sensing degree project, combining live earth-observation data with a full-stack web application.

**Live app:** [wildfire-monitor-3evc.vercel.app](https://wildfire-monitor-3evc.vercel.app)

---

## Overview

Wildfire Monitor ingests active-fire detections from NASA's FIRMS (Fire Information for Resource Management System) API and presents them through an interactive dashboard — combining real-time satellite monitoring, custom spatial analysis, and an AI assistant for natural-language data queries.

Unlike typical bootcamp-style CRUD projects, this system processes genuine remote sensing data (VIIRS and MODIS satellite instruments) and implements an original geospatial clustering algorithm to surface high-risk fire zones — the same category of analysis used by environmental monitoring agencies.

## Features

- **Live fire detection map** — interactive Leaflet map with 4 basemap styles (Light, Dark, Satellite, Terrain), Pakistan boundary overlay, and color-coded confidence markers
- **Historical search** — query any date from November 2000 to present; automatically switches between VIIRS (recent, high-resolution) and MODIS (archival) sources
- **Time-lapse playback** — animate through recent days of fire activity
- **Risk zone detection** — custom Haversine-formula-based spatial clustering algorithm groups nearby detections into risk zones, classified by severity
- **Trend analytics** — zoomable/pannable time-series chart of detection counts
- **AI assistant** — natural-language querying of live fire data via a Groq-hosted LLM
- **User accounts** — JWT authentication with OTP-based email verification and password reset
- **Watchlist & alerts** — save regions of interest; receive email alerts when new fires are detected nearby
- **Automated data refresh** — scheduled ingestion pipeline keeps data current without manual intervention
- **Methodology page** — full technical writeup of the data pipeline and clustering algorithm

## Tech Stack

**Frontend:** React (Vite), Leaflet.js, Chart.js, Axios
**Backend:** Node.js, Express, MongoDB (Mongoose, 2dsphere geospatial indexing)
**Auth:** JWT, bcrypt
**AI:** Groq (Llama 3.3 70B)
**Email:** Nodemailer
**Data source:** NASA FIRMS API (VIIRS NOAA-20, MODIS)
**Deployment:** Vercel (frontend + backend)

## Architecture

```
client/          React frontend (Vite)
server/
  models/        Mongoose schemas (Fire, User, Watchlist)
  routes/        Express route handlers
  middleware/    JWT auth middleware
  utils/         Email service
  index.js       Server entry point, scheduled data refresh
```

Fire data is fetched from the FIRMS Area API for a Pakistan-specific bounding box, parsed from CSV, and stored in MongoDB with GeoJSON Point geometry and a `2dsphere` index — enabling efficient radius-based spatial queries used throughout the app (watchlist proximity checks, risk-zone clustering).

## Methodology

The risk-zone detection algorithm is a custom single-pass, radius-based spatial clustering method:

1. Pairwise great-circle distance between detections is computed via the **Haversine formula**
2. Detections within a 15km radius of an unvisited point are grouped into a cluster
3. Clusters of 3+ detections are surfaced as risk zones (moderate / high / severe, by size)

Full technical writeup — including data source details, resolution tradeoffs, and known limitations — is available on the app's in-product [Methodology page](https://wildfire-monitor-3evc.vercel.app).

## Local Setup

**Prerequisites:** Node.js, a MongoDB Atlas connection string, a [NASA FIRMS API key](https://firms.modaps.eosdis.nasa.gov/api/map_key/), a [Groq API key](https://console.groq.com/keys), and a Gmail App Password (for email features).

```bash
# Clone
git clone https://github.com/aleesha112/wildfire-monitor.git
cd wildfire-monitor

# Backend
cd server
npm install
# create a .env file — see Environment Variables below
node index.js

# Frontend (in a new terminal)
cd client
npm install
# create a .env file — see Environment Variables below
npm run dev
```

### Environment Variables

**server/.env**
```
MONGO_URI=your_mongodb_connection_string
FIRMS_API_KEY=your_nasa_firms_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
PORT=5000
```

**client/.env**
```
VITE_API_URL=http://localhost:5000
```

## Data Attribution

Fire detection data courtesy of NASA FIRMS (Fire Information for Resource Management System), part of NASA's Land, Atmosphere Near real-time Capability for EOS (LANCE). VIIRS data is from the NOAA-20 satellite; historical data is from the MODIS instrument aboard the Terra and Aqua satellites.

## Author

Built by Aleesha Afzal as an applied GIS & Remote Sensing degree project.
