import React, { useEffect, useState } from 'react';
import { LuEye } from "react-icons/lu";
import axios from 'axios';
import './Requests.css'; // Import the CSS file
import TeamDetailsPopup from './TeamDetailsPopup';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [teamDetails, setTeamDetails] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8081/student/all_removal_requests'); 
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId, eventId, rollNo, action) => {
    try {
      let response;
      if (action === 'add') {
        response = await axios.post('http://localhost:8081/student/approve_addition', {
          eventId,
          rollNo
        });
      } else if (action === 'delete') {
        response = await axios.post('http://localhost:8081/student/approve_removal', {
          eventId,
          rollNo
        });
      } else {
        throw new Error('Unknown action type');
      }

      if (response.status === 200) {
        alert('Request approved and member status updated!');
        setRequests(requests.filter(request => request.id !== requestId));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('There was an error approving the request. Please try again.');
    }
  };

  const handleViewTeamDetails = async (eventId, teamName) => {
    try {
      const encodedTeamName = encodeURIComponent(teamName);
      const response = await axios.get(`http://localhost:8081/student/team_details/${eventId}/${encodedTeamName}`);
      setTeamDetails(response.data);
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error fetching team details:', error);
      alert('There was an error fetching the team details. Please try again.');
    }
  };

  return (
    <div className="requests-container">
      <h2>Requests</h2>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Event Name</th>
            <th>Team Name</th>
            <th>Action</th>
            <th>Reason</th>
            <th>View Team Details</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-requests" style={{ textAlign: "center" }}>No requests available</td>
            </tr>
          ) : (
            requests.map((request, index) => (
              <tr key={request.id}>
                <td>{index + 1}</td>
                <td>{request.eventName}</td>
                <td>{request.teamName}</td>
                <td>{request.action}</td>
                <td>{request.reason}</td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => handleViewTeamDetails(request.eventId, request.teamName)}>
                    <LuEye size={23} color="blue" />
                  </button>
                </td>
                <td style={{ display:'flex', justifyContent: "center" }}>
                  <button 
                    className='approve-button' 
                    onClick={() => handleApprove(request.id, request.eventId, request.rollNo, request.action)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Popup Component */}
      <TeamDetailsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        teamDetails={teamDetails}
      />
    </div>
  );
}

export default Requests;
