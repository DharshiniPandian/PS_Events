// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { UserContext } from '../UserContext';
// import { useNavigate } from 'react-router-dom';
// import './RegisteredEvents.css';

// const RegisteredEvents = () => {
//   const { user } = useContext(UserContext);
//   const [events, setEvents] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchRegisteredEvents = async () => {
//       try {
//         console.log("hi")
//         const response = await axios.get(`http://localhost:8081/student/registered/${user.email}`);
//         console.log('Registered events:', response.data); // Debugging: log the fetched data
//         setEvents(response.data);
//       } catch (error) {
//         console.error('Error fetching registered events:', error);
//       }
//     };

//     if (user?.email) { // Check if user email is available
//       fetchRegisteredEvents();
//     }
//   }, [user?.email]);

//   const handleCardClick = (eventName) => {
//     navigate(`/registration-status/${eventName}`);
//   };

//   return (
//     <div className="registered-events">
//       <h2>Registered Events</h2>
//       <div className="events-list">
//         {events.map((event) => (
//           <div 
//             key={event.name} 
//             className="event-card" 
//             onClick={() => handleCardClick(event.name)}
//           >
//             {event.eventImage ? (
//               <img 
//                 src={`http://localhost:8081/${event.eventImage.replace(/\\/g, '/')}`} 
//                 alt={event.name} 
//                 className="event-image" 
//               />
//             ) : (
//               <div className="no-image-placeholder">No Image</div>
//             )}
//             <p className="event-name">{event.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RegisteredEvents;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import './RegisteredEvents.css'; 

const RegisteredEvents = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/student/registered/${user.email}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching registered events:', error);
      }
    };

    fetchRegisteredEvents();
  }, [user.email]);

  const handleCardClick = (eventName) => {
    navigate(`/registeredevents/registration-status/${eventName}`); // Use navigate for redirection
  };

  return (
    <div className="registered-events">
      <h2>Registered Events</h2>
      <div className="events-list">
        {events.map((event) => (
          <div 
            key={event.name} 
            className="event-card" 
            onClick={() => handleCardClick(event.name)} // Handle card click
          >
            {event.eventImage ? (
              <img 
                src={`http://localhost:8081/${event.eventImage.replace(/\\/g, '/')}`} 
                alt={event.name} 
                className="event-image" 
              />
            ) : (
              <div className="no-image-placeholder">No Image</div>
            )}
            <h2 className="event-name">{event.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisteredEvents;
