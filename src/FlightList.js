import React from 'react';

const FlightList = ({ flights }) => {
  return (
    <div>
      <h2>Flights Near Zip Code</h2>
      {flights.length === 0 ? (
        <p>No flights found.</p>
      ) : (
        <ul>
          {flights.map((flight) => (
            <li key={flight.flight_date + flight.flight.icao_number}>
              Flight {flight.flight.iata_number} from {flight.departure.iata} to{' '}
              {flight.arrival.iata}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FlightList;
