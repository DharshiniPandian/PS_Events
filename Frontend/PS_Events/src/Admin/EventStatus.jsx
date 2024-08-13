import './EventStatus.css';
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import { FaPen } from "react-icons/fa6";
import EventUpdateForm from "./EventUpdateForm";
import { LuEye } from "react-icons/lu";
// import TeamDetails from './TeamDetails';
import EventRegistrationData from './EventRegistrationData'
import { FaArrowCircleLeft } from "react-icons/fa";

const EventStatus= () => {
    const [events, setEvents] = useState([]);
    const {id} =useParams();

    useEffect(() => {
        fetchEvents();
    }, [id]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/events/${id}`);
            console.log(response.data)
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
  return (
    <>
    <div className='event'>
    <div className="title">
    <Link to={`/events`} className="back-link">
          <FaArrowCircleLeft size={28} color="black" />
        </Link>
    <h1>Event Status</h1>
    </div>
    <div className='event-status-container'>
        <div className='team-details'>
    {/* <TeamDetails></TeamDetails> */}
    <EventRegistrationData name={events.name} eventid={id}/>
    </div>
    <div className="EventStatus">
        <div className="event-cards">
        {/* {events.map(event => ( */}

        {/* <Link to={`/eventupdate/:${events.id}`}> */}
                            {events.eventImage && (
                                <img
                                    width="100%"
                                    src={`http://localhost:8081/${events.eventImage.replace(/\\/g, '/')}`}
                                    alt={events.name}
                                    className="event-image"
                                />
                            )}
                             <div className='course-container'>
                            <h2 className="event-text">{events.name} <div className="icon-container">
                                <Link to={`/details/${events.id}`}>
                                    <LuEye size={23} color="blue" className="eye-icon" />
                                </Link>
                                {/* <FaPen size={18} color="black" className="pen-icon" /> */}
                            </div></h2>
                            </div>
                        {/* </Link> */}
                        </div>
                {/* ))} */}

    </div>
    </div>
    </div>
    
    </>
  )
}

export default EventStatus