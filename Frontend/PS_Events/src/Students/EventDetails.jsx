import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowCircleLeft } from "react-icons/fa";
import "./EventDetails.css"

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Error fetching event details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!event) return <div>No event found.</div>;

  const departments = Array.isArray(event.departments)
    ? event.departments.join(", ")
    : "N/A";

  const imageUrl = event.eventImage
    ? `http://localhost:8081/${event.eventImage.replace(/\\/g, "/")}`
    : null;
  const noticeUrl = event.eventNotice
    ? `http://localhost:8081/${event.eventNotice.replace(/\\/g, "/")}`
    : null;

  return (
    <div className="event-details">
      <div className="title">
        <Link to="/home">
          <FaArrowCircleLeft
            size={18}
            color="black"
            aria-label="Back to events"
          />
        </Link>
        <h1>{event.name}</h1>
      </div>
      <div className="event-data">
        <h3>Description:</h3>
        <p className="date-block">{event.description || "N/A"}</p>
        <div className="date-container">
          <h3 className="date-align">Registration Start Date:</h3>
          <p className="date-block">
            {" "}
            {formatDate(event.registrationStartDate)}
          </p>
          <h3 className="date-align">Registration End Date:</h3>
          <p className="date-block"> {formatDate(event.registrationEndDate)}</p>
        </div>
        <div className="date-container">
          <h3 className="date-align">Event Start Date:</h3>
          <p className="date-block"> {formatDate(event.eventStartDate)}</p>
          <h3 className="date-align">Event End Date:</h3>
          <p className="date-block"> {formatDate(event.eventEndDate)}</p>
        </div>
        <div className="date-container">
          <h3 className="date-align">Event Mode:</h3>
          <p className="date-block"> {event.eventMode || "N/A"}</p>
          <h3 className="date-align">Team Size:</h3>
          <p className="date-block"> {event.teamSize || "N/A"}</p>
        </div>
       
          <h3>
            Event Link:
            <a href={event.eventLink} target="_blank" rel="noopener noreferrer">
              {event.eventLink || "N/A"}
            </a>
          </h3>
         
          {noticeUrl && (
            <h3 style={{marginTop:"37px"}}>
              Event Notice:
              <a href={noticeUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </h3>
          )}
        
      </div>

      <div className="event-data">
        <h3>Departments:</h3>
        <p> {departments}</p>
      </div>

      <div className="event-data">
        <h3>Level Details:</h3>
        <div>
          <h3>Level Count: {event.levelCount}</h3>
          <h3>Level 1:</h3>
          <p>
          <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p>  <br></br>
            <br /> {event.level1description || "N/A"}
          </p>{" "}
          <br />
          <p><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level1rewards || "N/A"}</p>
          {event.level2description !== "-" && (
            <div>
              <h3>Level 2:</h3>
              <p>
              <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p> <br></br> <br /> {event.level2description || "N/A"}
              </p>{" "}
              <br />
              <p><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level2rewards || "N/A"}</p>{" "}
            </div>
          )}
          {event.level3description !== "-" && (
            <div>
              <h3>Level 3:</h3>
              <p>
              <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p> <br></br> <br /> {event.level3description || "N/A"}
              </p>{" "}
              <br />
              <p><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level3rewards || "N/A"}</p>{" "}
            </div>
          )}
          {event.level4description !== "-" && (
            <div>
              <h3>Level 4:</h3>
              <p>
              <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p> <br></br> <br /> {event.level4description || "N/A"}
              </p>{" "}
              <br />
              <p><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level4rewards || "N/A"}</p>{" "}
            </div>
          )}
        </div>
      </div>

      {imageUrl && (
        <>
          <h3 style={{ color: "black" }}>Event Image:</h3>
          <img
            src={imageUrl}
            alt={event.name}
            className="geo-tag-image"
            onClick={togglePopup}
          />
          {isPopupOpen && (
            <div className="popup-overlay" onClick={togglePopup}>
              <div className="popup-content">
                <img src={imageUrl} alt={event.name} />
              </div>
            </div>
          )}
        </>
      )}

      <div className="button-1">
        <Link to={`/home/eventregister/${event.name}`}>
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default EventDetails;
