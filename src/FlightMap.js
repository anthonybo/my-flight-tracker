import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const FlightMap = ({ flights }) => {
  const center = [34.6245, -112.395859]; // Default center for the map

  return (
    <MapContainer center={center} zoom={9} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {flights.map((flight) => (
        <Marker key={flight.hex} position={[flight.lat, flight.lon]}>
          <Popup>
            <div>
              <strong>Flight: {flight.flight}</strong>
              <br />
              Altitude: {flight.alt_baro}
              <br />
              Speed: {flight.gs}
              <br />
              Squawk: {flight.squawk}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FlightMap;
