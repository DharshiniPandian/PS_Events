import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import './Events.css';
import { CiCirclePlus } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

const Events = () => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:8081/events');
            console.log(response.data)
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="event">
            <h1>Event Upload</h1>
            <br></br>
            <div className="header-container">
            <Link to="/events/upload">
                <button className='navigate-button'>+  Create Event</button>
                {/* <CiCirclePlus className="circle-icon"/> */}
            </Link>
            <div className="search-container"> 
            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            /><CiSearch className="search-icon"/>
            
            </div>
            </div>
            <div className="event-cards">
                {/* {events.map(event => (  */}
            {filteredEvents.map(event => (
                    <div key={event.id} className="event-card">
                        <Link to={`/events/eventstatus/${event.id}`}>
                            {event.eventImage && (
                                <img
                                    src={`http://localhost:8081/${event.eventImage.replace(/\\/g, '/')}`}
                                    alt={event.name}
                                    className="event-image"

                                />
                            )}
                            <h2 className="event-text">{event.name}</h2>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;