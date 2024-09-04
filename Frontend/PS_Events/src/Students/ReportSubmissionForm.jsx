// import React, { useState, useContext, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { UserContext } from "../UserContext";
// import "./ReportSubmissionForm.css";
// import { FaArrowCircleLeft } from "react-icons/fa";

// const eventStatuses = ["Winner", "Second Runner", "Runner", "Participated", "Qualified for next Level"];

// function ReportSubmissionForm() {
//   const { eventName } = useParams();
//   const [teamName, setTeamName] = useState("");
//   const [projectTitle, setProjectTitle] = useState("");
//   const [reportDocument, setReportDocument] = useState(null);
//   const [geoTagImage, setGeoTagImage] = useState(null);
//   const [certificates, setCertificates] = useState(null);
//   const [eventStatus, setEventStatus] = useState("");
//   const [imageError, setImageError] = useState("");
//   const [certificatesError, setCertificatesError] = useState("");
//   const navigate = useNavigate();
//   const { user } = useContext(UserContext);
//   const email = user.email;

//   useEffect(() => {
//         if (eventName) {
//           axios
//             .get(`http://localhost:8081/student/report/details`, {
//               params: { eventName, email }
//             })
//             .then((response) => {
//               const { teamName, projectTitle} = response.data;
//               setTeamName(teamName || "");
//               setProjectTitle(projectTitle || "");
//             })
//             .catch((error) => {
//               console.error("Error fetching report details:", error);
//             });
//         }
//       }, [eventName, email]);

//       console.log()

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const formData = new FormData();
//     formData.append("eventName", eventName);
//     formData.append("teamName", teamName);
//     formData.append("projectTitle", projectTitle);
//     if (reportDocument) formData.append("reportDocument", reportDocument);
//     if (geoTagImage) formData.append("geoTagImage", geoTagImage);
//     if (certificates) formData.append("certificates", certificates);
//     formData.append("eventStatus", eventStatus);
//     formData.append("email", email);

//     axios.post("http://localhost:8081/student/report/upload", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     })
//       .then(() => {
//         alert("Report Submission Successful");
//         navigate(`/registeredevents/registration-status/${eventName}`);
//       })
//       .catch((error) => {
//         console.error("Error submitting report:", error);
//       });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file && !["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
//       setImageError("Please upload a valid image file (jpg, jpeg, or png).");
//       setGeoTagImage(null);
//     } else {
//       setImageError("");
//       setGeoTagImage(file);
//     }
//   };

//   const handleCertificatesChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type !== "application/pdf") {
//       setCertificatesError("Please upload a valid PDF file for certificates.");
//       setCertificates(null);
//     } else {
//       setCertificatesError("");
//       setCertificates(file);
//     }
//   };

//   return (
//     <>
//       <div className="title">
//         <Link to={`/registeredevents/registration-status/${eventName}`}>
//           <FaArrowCircleLeft size={28} color="black" />
//         </Link>
//         <h1>Report Submission</h1>
//       </div>
//       <div className="reportSubmissionForm">
//         <form className="submissionForm" onSubmit={handleSubmit}>
//           <label>
//             <p>Event Name:<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input className="box" type="text" value={eventName} readOnly />
//           </label>
//           <label>
//             <p>Team Name:<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input
//               className="box"
//               type="text"
//               value={teamName}
//               readOnly
//             />
//           </label>
//           <label>
//             <p>Project Title:<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input
//               className="box"
//               type="text"
//               value={projectTitle}
//               readOnly
//             />
//           </label>
//           <label>
//             <p>Report Document (PDF):<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input
//               className="box"
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => setReportDocument(e.target.files[0])}
//               required
//             />
//           </label>
//           <label>
//             <p>Geo-tag Image:<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input
//               className="box"
//               type="file"
//               accept="image/jpeg,image/png,image/jpg"
//               onChange={handleImageChange}
//               required
//             />
//           </label>
//           {imageError && <p className="error-message">{imageError}</p>}
//           <label>
//             <p>Certificates (PDF):<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <input
//               className="box"
//               type="file"
//               accept="application/pdf"
//               onChange={handleCertificatesChange}
//               required
//             />
//           </label>
//           {certificatesError && <p className="error-message">{certificatesError}</p>}
//           <label>
//             <p>Event Status:<p style={{ color: "red", fontSize: "15px", display: "inline" }}>*</p></p>
//             <select
//               value={eventStatus}
//               onChange={(e) => setEventStatus(e.target.value)}
//               className={eventStatus === "" ? "default-option" : ""}
//               required
//             >
//               <option value="" disabled>Select status</option>
//               {eventStatuses.map((status) => (
//                 <option key={status} value={status}>{status}</option>
//               ))}
//             </select>
//           </label>
//           <button type="submit" className="submit-button">Submit Report</button>
//         </form>
//       </div>
//     </>
//   );
// }

// export default ReportSubmissionForm;


















import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams,Link } from "react-router-dom";
import { UserContext } from '../UserContext';
import './ReportSubmissionForm.css';
import { FaArrowCircleLeft } from "react-icons/fa";

const eventStatuses = ["Winner", "Second Runner", "Runner", "Participated", "Qualified for next Level"];

function ReportSubmissionForm() {
  const { eventName } = useParams();
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [reportDocument, setReportDocument] = useState(null);
  const [geoTagImage, setGeoTagImage] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [eventStatus, setEventStatus] = useState("");
  const [imageError, setImageError] = useState("");
  const [certificatesError, setCertificatesError] = useState("");
  const [reSubmit, setReSubmit] = useState(0);
  const [level, setLevel] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const email = user.email;

  useEffect(() => {
    if (eventName) {
      axios
        .get(`http://localhost:8081/student/report/details`, {
          params: { eventName, email }
        })
        .then((response) => {
          const { teamName, projectTitle, reSubmit, document, geoTag, certificates, eventStatus, level } = response.data;
          setTeamName(teamName || "");
          setProjectTitle(projectTitle || "");
          setReSubmit(reSubmit || 0);
          setLevel(level || "");
          if (reSubmit === 1) {
            setEventStatus(eventStatus || "");
            setReportDocument(document || null);
            setGeoTagImage(geoTag || null);
            setCertificates(certificates || null);
          } else {
            setEventStatus(""); // Reset eventStatus for first-time submission
          }
        })
        .catch((error) => {
          console.error("Error fetching report details:", error);
        });
    }
  }, [eventName, email]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("eventName", eventName);
    formData.append("teamName", teamName);
    formData.append("projectTitle", projectTitle);
    if (reportDocument) formData.append("reportDocument", reportDocument);
    if (geoTagImage) formData.append("geoTagImage", geoTagImage);
    if (certificates) formData.append("certificates", certificates);
    formData.append("eventStatus", eventStatus);
    formData.append("email", email);
    formData.append("level", level);

    const axiosRequest = reSubmit === 1 ? axios.put : axios.post;
    const url = `http://localhost:8081/student/report/${reSubmit === 1 ? 'update' : 'upload'}`;

    axiosRequest(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        alert("Report Submission Successful");
        navigate(`/registeredevents/registration-status/${eventName}`);
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
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
      <div className='title'>
    <Link to={`/registeredevents/registration-status/${eventName}`}>
          <FaArrowCircleLeft size={28} color="black"/>
        </Link>
      <h1>Report Submission</h1>
      </div>
      <div className="reportSubmissionForm">
        <form className="submissionForm" onSubmit={handleSubmit}>
          <label>
          <p>Event Name:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
              type="text"
              value={eventName}
              readOnly
            />
          </label>
          <label>
          <p>Team Name:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
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
          <p>Project Title:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
              type="text"
              value={projectTitle}
              readOnly
              onChange={(e) => setProjectTitle(e.target.value)}

            />
          </label>
          <label>
          <p>Report Document (PDF):<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            {reportDocument && typeof reportDocument === 'string' && (
              <a href={`http://localhost:8081/${reportDocument.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                View Current Document
              </a>
            )}
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={(e) => setReportDocument(e.target.files[0])}
              
            />
          </label>
          <label>
          <p>Geo-tag Image:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            {geoTagImage && typeof geoTagImage === 'string' && (
              <a href={`http://localhost:8081/${geoTagImage.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                View Current Image
              </a>
            )}
            <input
              className="box"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              
            />
          </label>
          {imageError && <p className="error-message">{imageError}</p>}
          <label>
          <p>Certificates (PDF):<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            {certificates && typeof certificates === 'string' && (
              <a href={`http://localhost:8081/${certificates.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                View Current Certificates
              </a>
            )}
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={handleCertificatesChange}
            
            />
          </label>
          {certificatesError && <p className="error-message">{certificatesError}</p>}
          <label>
          <p>Event Status:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
              className={eventStatus === "" ? "default-option" : ""}
              
            >
              <option value="" disabled>Select status</option>
              {eventStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="submit-button">Submit Report</button>
        </form>
      </div>
    </>
  );
}

export default ReportSubmissionForm;
