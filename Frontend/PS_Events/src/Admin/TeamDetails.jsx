import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowCircleLeft } from "react-icons/fa";
import ViewReport from "./ViewReport";
import "./TeamDetails.css";

const TeamDetails = () => {
  const { eventid, eventId, teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [showRejectionPopup, setShowRejectionPopup] = useState(false); 
  const [rewardPoints, setRewardPoints] = useState({});
  const [showReSubmitPopup, setShowReSubmitPopup] = useState(false);
  const [reSubmitReason, setReSubmitReason] = useState("");
  const navigate = useNavigate();
  const [no, setNo] = useState(0);
  const [no1,setNo1]=useState(0);

  useEffect(() => {
    fetchTeamDetails();
    setNo1(eventid);
  }, [eventId, teamName]);

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/events/${eventId}/teams/${teamName}`
      );
      setTeam(response.data);
      // console.log("hi")
      // console.log(eventid);
      // console.log(eventId);
      // console.log(response.data);
      setNo(eventId);
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  };

  const handleApprove = () => {
    handleApprovalSubmit();
  };

  const handleReject = () => {
    setShowRejectionPopup(true); 
  };

  const handleReSubmit = () => {
    setShowReSubmitPopup(true); 
  };

  const handleRewardChange = (name, points) => {
    setRewardPoints((prevPoints) => ({ ...prevPoints, [name]: points }));
  };

  const handleApprovalSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:8081/events/${eventId}/teams/${teamName}/approve`
      );

      alert("Team approved successfully!");
      navigate(`/eventstatus/${eventid}`);
    } catch (error) {
      console.error("Error approving team:", error);
    } finally {
      setShowApprovalPopup(false);
    }
  };

  const handleRejectionSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:8081/events/${eventid}/teams/${teamName}/reject`,
        { rejectionReason }
      );
      alert("Team rejected successfully!");
      navigate(`/eventstatus/${eventid}`);
    } catch (error) {
      console.error("Error rejecting team:", error);
    } finally {
      setShowRejectionPopup(false); 
    }
  };

  const handleReSubmitfunc = async () => {
    try {
      await axios.put(
        `http://localhost:8081/events/${eventId}/teams/${teamName}/reSubmit`,
        { reSubmitReason }
      );
      alert("Request for ReSubmission is successfully!");
      navigate(`/eventstatus/${eventid}`);
    } catch (error) {
      console.error("Error in asking for resubmission team:", error);
    } finally {
      setShowReSubmitPopup(false); 
    }
  };

  if (!team) {
    return <div>Loading...</div>;
  }

  const teamLeader = team.members?.find((member) => member.isTeamLeader);

  return (
    <>
      <div className="team-detailss">
        <div className="title">
          <Link to={`/eventstatus/${eventid}`} className="back-link">
            <FaArrowCircleLeft size={28} color="black" />
          </Link>
          <h1>Team: {team.teamName}</h1>
        </div>
        <div className="event-data">
        <div className="detail-item">
          <h3>Project Title: </h3>
          <p>{team.projectTitle}</p>
        </div>
        <h3>Project Objective:</h3>
        <span></span> <p>{team.projectObjective}</p>
        <h3>Existing Methodology:</h3> <span></span>
        <p>{team.existingMethodology}</p>
        <h3>Proposed Methodology: </h3>
        <span></span>
        <p>{team.proposedMethodology}</p>
        <div className="detail-item">
          <h3>Team Size: </h3>
          <span></span>
          <p>{team.teamSize}</p>
        </div>
        </div>
        <br></br>
        <div className="event-data">
        <h2>Team Leader</h2>
        <span></span>
        {teamLeader ? (
          <>
            <ul>
              <div className="detail-item">
                <li>
                  <h3>Name:</h3>
                </li>
                <p>{teamLeader.name}</p>
              </div>
              <div className="detail-item">
                <li>
                  <h3>Email:</h3>
                </li>
                <p>{teamLeader.email}</p>
              </div>
              <div className="detail-item">
                <li>
                  <h3>Roll No:</h3>
                </li>
                <p>{teamLeader.rollNo}</p>
              </div>
              <div className="detail-item">
                <li>
                  <h3>Year:</h3>
                </li>
                <p>{teamLeader.year}</p>
              </div>
              <div className="detail-item">
                <li>
                  <h3>Department:</h3>
                </li>
                <p>{teamLeader.department}</p>
              </div>
            </ul>
          </>
        ) : (
          <p>No team leader assigned.</p>
        )}
        </div>
        {team.teamSize>1 && <h2>Team Members</h2> }
        <ul>
          {team.members
            ?.filter((member) => !member.isTeamLeader)
            .map((member, index) => (
              <li key={index}>
                <div className="detail-item">
                  <li>
                    <h3>Name:</h3>
                  </li>
                  <p> {member.name}</p>
                </div>

                <div className="detail-item">
                  <li>
                    <h3>Email:</h3>
                  </li>{" "}
                  <p>{member.email}</p>
                </div>
                <div className="detail-item">
                  <li>
                    <h3>Roll No:</h3>
                  </li>
                  <p> {member.rollNo}</p>
                </div>
                <div className="detail-item">
                  <li>
                    <h3>Year:</h3>
                  </li>
                  <p> {member.year}</p>
                </div>
                <div className="detail-item">
                  <li>
                    <h3>Department:</h3>{" "}
                  </li>
                  <p>{member.department}</p>
                </div>
              </li>
            ))}
        </ul>
        {team.RegistrationApproval  == 0 && team.reSubmit===0  && !team.rejected && (
          <button onClick={handleApprove} className="button">
            Approve
          </button>
        )}
       {team.RegistrationApproval === 0 && team.reSubmit===0 && !team.rejected &&
        <button onClick={handleReSubmit} className="button-rs">Resubmit</button>}
        {team.RegistrationApproval === 0 && team.reSubmit===0 && !team.rejected && (
          <button onClick={handleReject} className="button-r">
            Reject
          </button>
        )}
        {team.reSubmit==1 && <h2>Document was sent to be resubmitted</h2> && <div><h2 >Reason for Resubmission:</h2><p>{team.reSubmitReason}</p></div>}
    
        {team.RegistrationApproval  === 1 && <ViewReport eventID={no}  eventid={no1} />}
       
        {showRejectionPopup && (
          <div className="overlay">
            <div className="rejection-popup">
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection"
              />
              <button className="submit-button" onClick={handleRejectionSubmit}>Submit</button>
              <button className="cancel-button" onClick={() => setShowRejectionPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {showReSubmitPopup && (
          <div className="overlay">
            <div className="rejection-popup">
              <h3>ReSubmission Reason</h3>
              <textarea
                value={reSubmitReason}
                onChange={(e) => setReSubmitReason(e.target.value)}
                placeholder="Enter the reason for resubmission"
              />
              <button onClick={handleReSubmitfunc}>Submit</button>
              <button onClick={() => setShowReSubmitPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamDetails;
