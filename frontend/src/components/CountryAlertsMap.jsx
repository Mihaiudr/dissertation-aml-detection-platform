import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";

const COUNTRY_COORDINATES = {
  Albania: [41.15, 20.17],
  Algeria: [28.03, 1.66],
  Argentina: [-38.42, -63.62],
  Australia: [-25.27, 133.78],
  Austria: [47.52, 14.55],
  Belgium: [50.5, 4.47],
  Brazil: [-14.24, -51.93],
  Bulgaria: [42.73, 25.49],
  Canada: [56.13, -106.35],
  Chile: [-35.68, -71.54],
  China: [35.86, 104.2],
  Croatia: [45.1, 15.2],
  Cyprus: [35.13, 33.43],
  Denmark: [56.26, 9.5],
  Estonia: [58.6, 25.01],
  Finland: [61.92, 25.75],
  France: [46.23, 2.21],
  Germany: [51.17, 10.45],
  Greece: [39.07, 21.82],
  Hungary: [47.16, 19.5],
  India: [20.59, 78.96],
  Ireland: [53.41, -8.24],
  Italy: [41.87, 12.57],
  Japan: [36.2, 138.25],
  Latvia: [56.88, 24.6],
  Lithuania: [55.17, 23.88],
  Luxembourg: [49.82, 6.13],
  Malta: [35.94, 14.38],
  Mexico: [23.63, -102.55],
  Morocco: [31.79, -7.09],
  Netherlands: [52.13, 5.29],
  Nigeria: [9.08, 8.68],
  Norway: [60.47, 8.47],
  Poland: [51.92, 19.15],
  Portugal: [39.4, -8.22],
  Romania: [45.94, 24.97],
  Slovakia: [48.67, 19.7],
  Slovenia: [46.15, 14.99],
  Spain: [40.46, -3.75],
  Sweden: [60.13, 18.64],
  Switzerland: [46.82, 8.23],
  Turkey: [38.96, 35.24],
  Ukraine: [48.38, 31.17],
  UK: [55.38, -3.44],
  "United Kingdom": [55.38, -3.44],
  USA: [37.09, -95.71],
  "United States": [37.09, -95.71],
};

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function MapCountryFocus({ country }) {
  const map = useMap();

  useEffect(() => {
    if (!country) return;

    map.flyTo(country.position, Math.max(map.getZoom(), 4), {
      duration: 0.8,
    });
  }, [country, map]);

  return null;
}

function CountryAlertsMap({ alerts }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const countryCounts = new Map();

  alerts.forEach((alert) => {
    const countries = [alert.Sender_bank_location, alert.Receiver_bank_location].filter(Boolean);

    countries.forEach((country) => {
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    });
  });

  const countries = [...countryCounts.entries()]
    .filter(([country]) => COUNTRY_COORDINATES[country])
    .map(([country, count]) => ({ country, count, position: COUNTRY_COORDINATES[country] }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...countries.map((country) => country.count), 1);
  const selectedCountryData = countries.find((country) => country.country === selectedCountry);

  return (
    <section className="country-map-card">
      <div className="section-header compact">
        <div>
          <h2>Alerts by Country</h2>
          <p>Sender and receiver bank locations represented in flagged transactions.</p>
        </div>
      </div>

      {countries.length > 0 ? (
        <div className="country-map-layout">
          <div className="country-map-shell">
            <MapContainer
              attributionControl={false}
              center={[28, 8]}
              className="country-leaflet-map"
              minZoom={2}
              scrollWheelZoom
              zoom={2}
              zoomControl={false}
            >
              <MapResizeHandler />
              <MapCountryFocus country={selectedCountryData} />
              <ZoomControl position="topright" />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {countries.slice(0, 20).map((country) => {
                const isSelected = selectedCountry === country.country;

                return (
                  <CircleMarker
                    center={country.position}
                    eventHandlers={{ click: () => setSelectedCountry(country.country) }}
                    key={country.country}
                    pathOptions={{
                      color: isSelected ? "#19dcc0" : "#ffffff",
                      fillColor: isSelected ? "#087e58" : "#5aae6b",
                      fillOpacity: isSelected ? 0.92 : 0.78,
                      weight: isSelected ? 5 : 3,
                    }}
                    radius={(isSelected ? 15 : 10) + (country.count / maxCount) * 34}
                  >
                    <Tooltip className="country-marker-label" direction="center" permanent>
                      {country.count.toLocaleString()}
                    </Tooltip>
                    <Popup>
                      <strong>{country.country}</strong>
                      <br />
                      Alerts: {country.count.toLocaleString()}
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div className="country-alert-list">
            <h3>Top Countries</h3>
            {countries.slice(0, 8).map((country) => (
              <button
                className={`country-alert-row ${selectedCountry === country.country ? "active" : ""}`}
                key={country.country}
                onClick={() => setSelectedCountry(country.country)}
                type="button"
              >
                <span>{country.country}</span>
                <strong>{country.count.toLocaleString()}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chart-empty">Upload a CSV file to generate country data.</div>
      )}
    </section>
  );
}

export default CountryAlertsMap;
