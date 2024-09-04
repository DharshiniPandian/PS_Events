import React, { useEffect } from 'react';
import './TeamDetailsPopup.css';

function TeamDetailsPopup({ isOpen, onClose, teamDetails }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (event.target.className === 'popup-overlay') {
        onClose();
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Separate team details based on the 'active' status
  const activeMembers = teamDetails.filter(member => member.active === 1);
  const inactiveMembers = teamDetails.filter(member => member.active === 0);
  const newMembers = teamDetails.filter(member => member.active === -1);
  const deletionRequests = teamDetails.filter(member => member.active === -2);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Team Details</h3>

        {/* Active Members Table */}
        {activeMembers.length > 0 && (
          <div>
            <h4>Active Team Members</h4>
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Roll No</th>
                  <th>Year</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {activeMembers.map((member) => (
                  <tr key={member.memberId}>
                    <td>{member.name}</td>
                    <td>{member.rollNo}</td>
                    <td>{member.year}</td>
                    <td>{member.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inactive Members Table */}
        {inactiveMembers.length > 0 && (
          <div>
            <h4>Inactive Team Members</h4>
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Roll No</th>
                  <th>Year</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {inactiveMembers.map((member) => (
                  <tr key={member.memberId}>
                    <td>{member.name}</td>
                    <td>{member.rollNo}</td>
                    <td>{member.year}</td>
                    <td>{member.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New Members Table */}
        {newMembers.length > 0 && (
          <div>
            <h4>New Team Members</h4>
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Roll No</th>
                  <th>Year</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {newMembers.map((member) => (
                  <tr key={member.memberId}>
                    <td>{member.name}</td>
                    <td>{member.rollNo}</td>
                    <td>{member.year}</td>
                    <td>{member.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deletion Requests Table */}
        {deletionRequests.length > 0 && (
          <div>
            <h4>Team Members with Deletion Requests</h4>
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Roll No</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deletionRequests.map((member) => (
                  <tr key={member.memberId}>
                    <td>{member.name}</td>
                    <td>{member.rollNo}</td>
                    <td>{member.year}</td>
                    <td>{member.department}</td>
                    <td>Request Sent</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default TeamDetailsPopup;
