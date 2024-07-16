import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom'; // For navigation
import './Students.css';

function Students() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [department, setDepartment] = useState('');
    const { user } = useContext(UserContext);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchStudentAndEvents = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8081/events/student-events', {
                    params: { email: user.email }
                });
                const { department, events } = response.data;
                setDepartment(department);
                setEvents(events);
            } catch (error) {
                console.error('Error:', error);
                setError('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStudentAndEvents();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleEventClick = (id) => {
        navigate(`/events/${id}`); // Navigate to event details page
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Welcome</h1>
            <h2>Events for {department} Department</h2>
            <div className="event-cards">
                {events.length === 0 ? (
                    <p>No events available for your department.</p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="event-card" onClick={() => handleEventClick(event.id)}>
                            <h3>{event.name}</h3>
                            <img
                                src={`http://localhost:8081/${event.eventImage}`}
                                alt={event.name}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Students;
