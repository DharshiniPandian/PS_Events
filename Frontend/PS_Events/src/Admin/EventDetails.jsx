import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowCircleLeft } from "react-icons/fa";
import "./EventDetails.css";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  // const [teams, setTeams] = useState([]);
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

  if (!event) {
    return <div>Loading...</div>;
  }

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
    <>
      <div className="title">
        <Link to={`/eventstatus/${event.id}`}>
          <FaArrowCircleLeft size={28} color="black" />
        </Link>
        <h1>Event Details</h1>
      </div>
      <div className="event-details">
        <div className="tit">
        <h1 style={{ color: "black"}}>{event.name}</h1>
        <div className="event-data">
          <h3>Description:</h3>
          <p className="para-box">{event.description}</p>
          <div className="date-container">
            <h3 className="date-align">Registration Start Date:</h3>
            <p className="date-block">
              {formatDate(event.registrationStartDate)}
            </p>
            <h3 className="date-align">Registration End Date:</h3>
            <p className="date-block">
              {" "}
              {formatDate(event.registrationEndDate)}
            </p>
          </div>
          <div className="date-container">
            <h3 className="date-align">Event Start Date:</h3>
            <p className="date-block">{formatDate(event.eventStartDate)}</p>
            <h3 className="date-align">Event End Date:</h3>
            <p className="date-block">{formatDate(event.eventEndDate)}</p>
          </div>
          <div className="date-container">
            <h3>Event Mode: </h3>
            <p>{event.eventMode}</p>
            <h3 >Team Size:</h3>{" "}
            <p className="date-block">{event.teamSize}</p>
          </div>

          <h3>
            Event Link:{" "}
            <a href={event.eventLink} target="_blank" rel="noopener noreferrer">
              {event.eventLink}
            </a>
          </h3>
         
          {noticeUrl && (
            <h3 style={{marginTop:"40px"}}>
              Event Notice:
              <a href={noticeUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </h3>
          )}
        </div>

        <div className="event-data">
          <h3>Departments: </h3>
          <p className="para-box">{departments}</p>
          <div className="date-container">
            <h3 style={{ color: "black" }}>Eligible years: </h3>
            <p>{event.eligibleYears}</p>
          </div>

          <h3 style={{ color: "black" }}>Criteria:</h3>
          <div className="year-course-container">
          <div className="cri-container">
            <h3>Year 1:</h3>
            <h3>Year 2:</h3>
            <h3>Year 3:</h3>
            <h3>Year 4:</h3>
          </div>
          <div className="course-container">
            <div className="course-item">
              <p>Course</p>
              <p>{event.year1course || "N/A"}</p>
              <br></br>
              <p>{event.year2course || "N/A"}</p>
              <br></br>
              <p>{event.year3course || "N/A"}</p>
              <br></br>
              <p>{event.year4course || "N/A"}</p>
            </div>
            <div className="level-item">
              <p>Level</p>
              <p>{event.year1level || "N/A"}</p>
              <br></br>
              <p>{event.year2level || "N/A"}</p>
              <br></br>
              <p>{event.year3level || "N/A"}</p>
              <br></br>
              <p>{event.year4level || "N/A"}</p>
            </div>
          </div>
        </div>
        </div>

        <div className="event-data">
          <h3 style={{ color: "black" }}>Level Details:</h3>

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
                <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p>  <br></br>
                  <br /> {event.level2description || "N/A"}
                </p>{" "}
                <br />
                <p><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level2rewards || "N/A"}</p>{" "}
              </div>
            )}
            {event.level3description !== "-" && (
              <div>
                <h3>Level 3:</h3>
                <p>
                <p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}> Description: </p> <br></br>
                  <br /> {event.level3description || "N/A"}
                </p>{" "}
                <br />
                <p style={{display:"inline-block"}}><p style={{display:"inline-block",marginRight:"8px",fontWeight:"400",color:"#474747"}}>Rewards: </p>{event.level3rewards || "N/A"}</p>{" "}
              </div>
            )}
            {event.level4description !== "-" && (
              <div>
                <h3>Level 4:</h3>
                <p>
                  Description: <br></br>
                  <br /> {event.level4description || "N/A"}
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
          <Link to={`/update/${id}`}>
            <button>Update</button>
          </Link>
        </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
