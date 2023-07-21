import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const FlightTracker = () => {
  const [airport, setAirport] = useState('');
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null); // Track the selected flight

  // Load cached flight data on page load
  useEffect(() => {
    const cachedFlights = JSON.parse(localStorage.getItem('flightData'));
    if (cachedFlights) {
      setFlights(cachedFlights);
    }
  }, []);

  // Update cached flight data when flights change
  useEffect(() => {
    localStorage.setItem('flightData', JSON.stringify(flights));
  }, [flights]);

  const handleSearch = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/flights?airport=${airport}`);
      const activeFlights = response.data.data.filter((flight) => flight.flight_status === 'active');
      setFlights(activeFlights);
    } catch (error) {
      setError('Error fetching flights. Please check the airport location (IATA code).');
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

    const {
      flight_date,
      flight_status,
      departure,
      arrival,
      airline,
      flight,
      aircraft,
      live
    } = selectedFlight;

    return (
      <DialogContent>
        <Typography gutterBottom>Flight Date: {formatDateAndTime(flight_date)}</Typography>
        <Typography gutterBottom>Flight Status: {flight_status}</Typography>
        <Typography gutterBottom>
          Departure Airport: {departure.airport}, Scheduled Time: {formatDateAndTime(departure.scheduled)}
        </Typography>
        <Typography gutterBottom>
          Arrival Airport: {arrival.airport}, Scheduled Time: {formatDateAndTime(arrival.scheduled)}
        </Typography>
        <Typography gutterBottom>Airline Name: {airline.name}</Typography>
        <Typography gutterBottom>Flight Number: {flight.number}</Typography>
        {aircraft && (
          <Typography gutterBottom>
            Aircraft Registration: {aircraft.registration}, Type: {aircraft.icao24}
          </Typography>
        )}
        {live && (
          <Typography gutterBottom>
            Live Details: Latitude: {live.latitude}, Longitude: {live.longitude}, Altitude: {live.altitude}
          </Typography>
        )}
      </DialogContent>
    );
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Flight Tracker
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter an example airport location (IATA code); for example, Prescott is: PRC
      </Typography>
      <a target="_blank" href="https://www.iata.org/en/publications/directories/code-search/?airport.search=prescott">
        Website to obtain IATA codes
      </a>
      <br /><br />
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
          {flights.length > 0 && (
            <List>
              {flights.map((flight) => (
                <ListItem key={uuidv4()} onClick={() => handleFlightClick(flight)}>
                  <ListItemText
                    primary={`Flight ${flight.flight.number} is heading to ${flight.arrival.airport} (${flight.airline.name})`}
                  />
                </ListItem>
              ))}
            </List>
          )}
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

export default FlightTracker;
