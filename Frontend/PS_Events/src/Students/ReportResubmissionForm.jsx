import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./ReportSubmissionForm.css";
import { FaArrowCircleLeft } from "react-icons/fa";

const eventStatuses = ["Winner", "Second Runner", "Runner", "Participated", "Qualified for next Level"];

function ReportResubmissionForm() {
  const { eventName, level } = useParams();
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [reportDocument, setReportDocument] = useState(null);
  const [geoTagImage, setGeoTagImage] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [eventStatus, setEventStatus] = useState("");
  const [imageError, setImageError] = useState("");
  const [certificatesError, setCertificatesError] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const email = user.email;

  useEffect(() => {
    if (eventName && level) {
      axios
        .get(`http://localhost:8081/student/report/details`, {
          params: { eventName, email, level }
        })
        .then((response) => {
          const {
            teamName,
            projectTitle,
            document,
            geoTag,
            certificates,
            eventStatus,
          } = response.data;
          setTeamName(teamName || "");
          setProjectTitle(projectTitle || "");
          setEventStatus(eventStatus || "");
          setReportDocument(document || null);
          setGeoTagImage(geoTag || null);
          setCertificates(certificates || null);
        })
        .catch((error) => {
          console.error("Error fetching report details:", error);
        });
    }
  }, [eventName, level, email]);

  const handleResubmit = (event) => {
    event.preventDefault();
  
    // Create a new FormData object
    const formData = new FormData();
  
    // Append form fields to FormData
    if (eventName) formData.append("eventName", eventName);
    if (teamName) formData.append("teamName", teamName);
    if (projectTitle) formData.append("projectTitle", projectTitle);
    if (eventStatus) formData.append("eventStatus", eventStatus);
    if (email) formData.append("email", email);
    if (level) formData.append("level", level);
  
    // Append files to FormData if they exist
    if (reportDocument) {
      if (typeof reportDocument === 'string') {
        // If the document is already uploaded and not changed, skip appending
        formData.append("reportDocument", reportDocument);
      } else {
        formData.append("reportDocument", reportDocument);
      }
    }
  
    if (geoTagImage) {
      if (typeof geoTagImage === 'string') {
        formData.append("geoTagImage", geoTagImage);
      } else {
        formData.append("geoTagImage", geoTagImage);
      }
    }
  
    if (certificates) {
      if (typeof certificates === 'string') {
        formData.append("certificates", certificates);
      } else {
        formData.append("certificates", certificates);
      }
    }
  
    console.log([...formData.entries()]); // For debugging: log the FormData contents
  
    // Send the PUT request with FormData
    axios.put("http://localhost:8081/student/report/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => {
      alert("Report Resubmission Successful");
      navigate(`/registeredevents/report-details/${eventName}/${level}`);
    })
    .catch((error) => {
      console.error("Error resubmitting report:", error);
    });
  };
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setImageError("Please upload a valid image file (jpg, jpeg, or png).");
      setGeoTagImage(null);
    } else {
      setImageError("");
      setGeoTagImage(file);
    }
  };

  const handleCertificatesChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setCertificatesError("Please upload a valid PDF file for certificates.");
      setCertificates(null);
    } else {
      setCertificatesError("");
      setCertificates(file);
    }
  };

  return (
    <>
      <div className="title">
        <Link to={`/registeredevents/report-details/${eventName}/${level}`}>
          <FaArrowCircleLeft size={28} color="black" />
        </Link>
        <h1>Report Resubmission</h1>
      </div>
      <div className="reportSubmissionForm">
        <form className="submissionForm" onSubmit={handleResubmit}>
          <label>
            <p>Event Name:<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input className="box" type="text" value={eventName} readOnly />
          </label>
          <label>
            <p>Team Name:<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input
              className="box"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              readOnly
            />
          </label>
          <label>
            <p>Project Title:<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input
              className="box"
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
              readOnly
            />
          </label>
          <label>
            <p>Report Document (PDF):<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={(e) => setReportDocument(e.target.files[0])}
            />
            {reportDocument && typeof reportDocument === 'string' && (
              <div>
                <p>Previously Submitted Report Document:</p>
                <a href={`http://localhost:8081/${reportDocument.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                  View Report Document
                </a>
              </div>
            )}
          </label>

          <label>
            <p>Geo-tag Image:<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input
              className="box"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
            />
            {geoTagImage && typeof geoTagImage === 'string' && (
              <div>
                <p>Previously Submitted Geo-tag Image:</p>
                <a href={`http://localhost:8081/${geoTagImage.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                  View Geo-tag Image
                </a>
              </div>
            )}
          </label>

          {imageError && <p className="error-message">{imageError}</p>}
          <label>
            <p>Certificates (PDF):<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={handleCertificatesChange}
            />
            {certificates && typeof certificates === 'string' && (
              <div>
                <p>Previously Submitted Certificates:</p>
                <a href={`http://localhost:8081/${certificates.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                  View Certificates
                </a>
              </div>
            )}
          </label>

          {certificatesError && <p className="error-message">{certificatesError}</p>}
          <label>
            <p>Event Status:<span style={{ color: "red", fontSize: "15px", display: "inline" }}>*</span></p>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
              className={eventStatus === "" ? "default-option" : ""}
              required
            >
              <option value="" disabled>Select status</option>
              {eventStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="button-group">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ReportResubmissionForm;
