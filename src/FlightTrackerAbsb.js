import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FlightIcon from "./flight_marker.png";

const FlightTrackerAbsb = () => {
  const [airport, setAirport] = useState('');
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null); // Track the selected flight

  const ICON_URL = FlightIcon; // Replace with the URL of the image for the flight marker

  const handleSearch = async () => {
    try {
      setError('');
      setIsLoading(true);
      // Replace the API URL with the correct URL for the ABSB API
      const response = await axios.get(`http://localhost:5000/api/absb/flights?airport=${airport}`);
      setFlights(response.data.ac);
    } catch (error) {
      setError('Error fetching flights from the ABSB API. Please check the airport location (IATA code).');
      console.error('Error fetching flights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to format dates and times
  const formatDateAndTime = (dateTimeString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };

    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateTimeString));
  };

  // Handler to open the detailed information of a flight
  const handleFlightClick = (flight) => {
    setSelectedFlight(flight);
  };

  // Handler to close the detailed information modal
  const handleClose = () => {
    setSelectedFlight(null);
  };

  // Dialog to display detailed information
  const renderFlightDetails = () => {
    if (!selectedFlight) {
      return null;
    }

    // Extract flight data for detailed view
    const {
      hex,
      flight,
      t,
      alt_baro,
      alt_geom,
      gs,
      track,
      squawk,
      emergency,
      category,
      nav_qnh,
      nav_altitude_mcp,
      lat,
      lon,
      nic,
      rc,
      seen_pos,
      version,
      nic_baro,
      nac_p,
      nac_v,
      sil,
      sil_type,
      gva,
      sda,
      alert,
      spi,
      mlat,
      tisb,
      messages,
      seen,
      rssi,
      dst,
      dir,
    } = selectedFlight;

    return (
      <DialogContent>
        <Typography gutterBottom>Flight Hex: {hex}</Typography>
        <Typography gutterBottom>Flight: {flight}</Typography>
        <Typography gutterBottom>Type: {t}</Typography>
        <Typography gutterBottom>Barometric Altitude: {alt_baro}</Typography>
        <Typography gutterBottom>Geometric Altitude: {alt_geom}</Typography>
        <Typography gutterBottom>Ground Speed: {gs}</Typography>
        <Typography gutterBottom>Track: {track}</Typography>
        <Typography gutterBottom>Squawk: {squawk}</Typography>
        <Typography gutterBottom>Emergency: {emergency}</Typography>
        <Typography gutterBottom>Category: {category}</Typography>
        <Typography gutterBottom>Nav QNH: {nav_qnh}</Typography>
        <Typography gutterBottom>Nav Altitude MCP: {nav_altitude_mcp}</Typography>
        <Typography gutterBottom>Latitude: {lat}</Typography>
        <Typography gutterBottom>Longitude: {lon}</Typography>
        <Typography gutterBottom>NIC: {nic}</Typography>
        <Typography gutterBottom>RC: {rc}</Typography>
        <Typography gutterBottom>Seen Position: {seen_pos}</Typography>
        <Typography gutterBottom>Version: {version}</Typography>
        {/* Add more flight details as needed */}
      </DialogContent>
    );
  };

  // Create a map with markers for each flight
  useEffect(() => {
    const map = L.map('map').setView([34.624500, -112.395859], 8); // Replace with the default map center coordinates and zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); // Use OpenStreetMap tiles as the base layer

    // Helper function to update marker positions for live tracking
    const updateMarkerPositions = () => {
      flights.forEach((flight) => {
        const marker = markers[flight.hex];

        if (marker) {
          marker.setLatLng([flight.lat, flight.lon]);
        }
      });
    };

    const markers = {};

    // Add markers for each flight
    flights.forEach((flight) => {
      const markerIcon = L.icon({
        iconUrl: ICON_URL,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([flight.lat, flight.lon], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`<b>${flight.flight}</b><br>Type: ${flight.t}`).on('click', () => handleFlightClick(flight));

      markers[flight.hex] = marker;
    });

    // Set up live tracking by periodically updating marker positions
    const updateInterval = setInterval(() => {
      handleSearch();
      updateMarkerPositions();
    }, 5000); // Fetch new data and update every 5 seconds

    return () => {
      clearInterval(updateInterval);
      map.remove();
    }; // Clean up the map and interval when the component is unmounted
  }, [flights]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Flight Tracker (ABSB API)
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter an example airport location (IATA code); for example, Prescott is: PRC
      </Typography>
      <TextField
        label="Enter airport"
        value={airport}
        onChange={(e) => setAirport(e.target.value)}
        variant="outlined"
        size="small"
        onKeyPress={handleKeyPress}
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
        Search
      </Button>
      {isLoading ? (
        <CircularProgress style={{ margin: '20px auto', display: 'block' }} />
      ) : (
        <>
          {error && <Typography color="error">{error}</Typography>}
          <div id="map" style={{ height: '500px', marginTop: '20px' }}></div>
        </>
      )}

      {/* Dialog to display detailed information */}
      <Dialog open={Boolean(selectedFlight)} onClose={handleClose}>
        <DialogTitle>Detailed Information</DialogTitle>
        {renderFlightDetails()}
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlightTrackerAbsb;
