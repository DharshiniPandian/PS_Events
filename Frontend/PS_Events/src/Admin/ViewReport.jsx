import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import './ViewReport.css';

const ViewReport = ({ eventID,eventid }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [showResubmitPopup, setShowResubmitPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resubmitReason, setResubmitReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8081/events/report/${eventID}`)
      .then(response => {
        setReports(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the reports!", error);
        setError("There was an error fetching the reports.");
      });
  }, [eventID]);

  const handleApproveClick = (report) => {
    setSelectedReport(report);
    assignRewards(report.level);
    navigate(`/events/eventstatus/${eventid}`);
  };

  const assignRewards = (level) => {
    axios.post('http://localhost:8081/events/assign-rewards', { eventId: eventID, level })
      .then(() => {
        alert('Rewards assigned and approval status updated successfully!');
      })
      .catch(error => {
        console.error('There was an error assigning rewards!', error);
        alert('Failed to assign rewards.');
      });
  };

  const handleResubmitClick = (report) => {
    setSelectedReport(report);
    setShowResubmitPopup(true);
    handleResubmitSubmit()
 
  };

  const handleResubmitSubmit = () => {
    axios.post('http://localhost:8081/events/resubmit1', {
      eventId: eventID,
      level: selectedReport.level,
      reason: resubmitReason
    })
    .then(() => {
      alert('Resubmission reason submitted successfully!');
      setShowResubmitPopup(false);
      navigate(`/events/eventstatus/${eventid}`);
    })
    .catch(error => {
      console.error('There was an error submitting the resubmission reason!', error);
    });
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!Array.isArray(reports)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="view-report">
      {reports.length>0 &&
      reports.map(report => {
        const approvalProperty = `level${report.level}Approval`;
      
        return (
          <div key={report.level}>
            <h1><strong>Report : </strong>Level {report.level}</h1>
            <p><strong>Certificates:</strong> <a href={`http://localhost:8081/${report.certificates.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">View</a></p><br />
            <p className="geo-tag-image"><strong>GeoTag Image:</strong><img src={`http://localhost:8081/${report.geoTag.replace(/\\/g, '/')}`} alt="GeoTag" className="event-image" /></p><br />
            <p><strong>Document:</strong> <a href={`http://localhost:8081/${report.document.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">View</a></p><br />
            <p><strong>Event Status: </strong>{report.eventStatus}</p><br />
            {!report[approvalProperty] && !report.reSubmit && (
              <>
                <button onClick={() => handleResubmitClick(report)} className="button-rs">Resubmit</button>
                <button onClick={() => handleApproveClick(report)} className="approve-button">Approve</button>
              </>
            )}
             {report.reSubmit==1 && <h2>Document was sent to be resubmitted</h2> && <div><h2 >Reason for Resubmission:</h2><p>{report.reSubmitReason}</p></div>}
          </div>
        );
      })}
    

      {showResubmitPopup && (
      <div className="overlay">
          <div className="rejection-popup">
            <h2>Resubmit Reason</h2>
            <textarea
            className="te"
              value={resubmitReason}
              onChange={(e) => setResubmitReason(e.target.value)}
              placeholder="Enter resubmit reason"
            ></textarea>
            <button onClick={handleResubmitSubmit} className="submit-button">Submit</button>
            <button onClick={() => setShowResubmitPopup(false)} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReport;
