import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserContext } from '../UserContext';
import { FaEdit } from "react-icons/fa";
import { FaArrowCircleLeft } from "react-icons/fa";

function ReportDetails() {
  const { eventName, level } = useParams(); // Get event name and level from the URL
  const [reportDetails, setReportDetails] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const email = user.email;

  console.log(eventName,level,email)

  useEffect(() => {
    axios
      .get(`http://localhost:8081/student/report/details/level`, {
        params: { eventName, email, level }
      })
      .then((response) => {
        setReportDetails(response.data[0]);
        console.log("hello",response.data)
      })
      .catch((error) => {
        console.error("Error fetching report details:", error);
      });
  }, [eventName, email, level]);


  const handleEdit = () => {
    navigate(`/registeredevents/reportReSubmissionForm/${eventName}/${level}`);
  };

  return (
    <div className="reportDetails">
      <div className="title">
        <Link to={`/registeredevents/registration-status/${eventName}`}>
          <FaArrowCircleLeft size={28} color="black" />
        </Link>
        <h1>Report Details for {eventName} - Level {level}</h1>
      </div>
     
      <div className="report-info">
        <p><strong>Team Name:</strong> {reportDetails.teamName}</p>
        <p><strong>Project Title:</strong> {reportDetails.projectTitle}</p>
        <p><strong>Event Status:</strong> {reportDetails.eventStatus}</p>
        <p><strong>Report Document:</strong> 
          {reportDetails.document && (
            <a href={`http://localhost:8081/${reportDetails.document.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
              View Document
            </a>
          )}
        </p>
        <p><strong>Geo-tag Image:</strong> 
          {reportDetails.geoTag && (
            <a href={`http://localhost:8081/${reportDetails.geoTag.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
              View Image
            </a>
          )}
        </p>
        <p><strong>Certificates:</strong> 
          {reportDetails.certificates && (
            <a href={`http://localhost:8081/${reportDetails.certificates.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
              View Certificates
            </a>
          )}
        </p>
      </div>
      {reportDetails[`level${level}Approval`] === 0 && reportDetails.isTeamLeader===1 && (
  <button onClick={handleEdit} className="edit-button">
    <FaEdit /> Edit Report
  </button>
)}

    </div>
  );
}

export default ReportDetails;
