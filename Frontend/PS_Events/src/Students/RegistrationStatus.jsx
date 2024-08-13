import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./RegistrationStatus.css";
import { FaArrowCircleLeft } from "react-icons/fa";

const RegistrationStatus = () => {
  const { eventName } = useParams();
  const { user } = useContext(UserContext);
  const [registrationData, setRegistrationData] = useState({});
  const [showReason, setShowReason] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [showSubmitButtonLevel2, setShowSubmitButtonLevel2] = useState(false);
  const [showSubmitButtonLevel3, setShowSubmitButtonLevel3] = useState(false);
  const [showSubmitButtonLevel4, setShowSubmitButtonLevel4] = useState(false);
  const [levelReports, setLevelReports] = useState([]);
  const [status, setStatus] = useState(null);
  const [level1Status, setLevel1Status] = useState(null);
  const [level2Status, setLevel2Status] = useState(null);
  const [level3Status, setLevel3Status] = useState(null);
  const [level4Status, setLevel4Status] = useState(null);
  const [level1Reason, setLevel1Reason] = useState(null);
  const [level2Reason, setLevel2Reason] = useState(null);
  const [level3Reason, setLevel3Reason] = useState(null);
  const [level4Reason, setLevel4Reason] = useState(null);
  const [level1qualification, setLevel1qualification] = useState(null);
  const [level2qualification, setLevel2qualification] = useState(null);
  const [level3qualification, setLevel3qualification] = useState(null);
  const [leader, setLeader] = useState(false);
  const [data1, setData1] = useState(null);
  const [teamdetails,setTeamdetails] = useState(null);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/student/registration-status/${eventName}/${user.email}`
        );
        const data = response.data;
       console.log("Registration Status Data:", data);

        updateStatus(data);

        if (!data || typeof data !== "object") {
          throw new Error("Invalid data received");
        }

        setRegistrationData(data);

        if (data.rejected || data.reSubmitReason) {
          setShowReason(true);
        }

        if (data.RegistrationApproval === 1 || data.reSubmit === 1) {
          const eventResponse = await axios.get(
            `http://localhost:8081/student/events/getEventData/${eventName}/${user.email}`
          );
          const eventData = eventResponse.data;
         console.log("Event Data:", eventData);
          setData1(eventData);

          if (eventData.isTeamLeader === 1) setLeader(true);
         // console.log("leader", leader);

          if (
            eventData.isTeamLeader === 1 &&
            data.RegistrationApproval === 1 &&
            !data.rejected &&
            data.reSubmit === 0 &&
            data.level1Approval === 0
          ) {
            setShowSubmitButton(true);
          }

          const id = data.eventId;
          //console.log("Event ID:", id);

          const reportResponse = await axios.get(
            `http://localhost:8081/student/reports/${id}`
          );
          const reports = reportResponse.data;
          console.log("Level Reports:", reports);
          setLevelReports(reports);
          reports.forEach((report, index) => {
           // console.log(`Report ${index + 1} eventStatus:`, report.eventStatus);
            if (index === 0) setLevel1qualification(report.eventStatus);
            if (index === 1) setLevel2qualification(report.eventStatus);
            if (index === 2) setLevel3qualification(report.eventStatus);
          });
       
          updateLevelStatus(data, reports, eventData);

          const teamdata=await axios.get(`http://localhost:8081/student/team_members/${id}`);
          setTeamdetails(teamdata.data)
          console.log("Team members:",teamdetails)
          
        }
      } catch (error) {
        console.error(
          "Error fetching registration status:",
          error.message || error
        );
      }
    };

    fetchRegistrationStatus();
  }, [eventName, user.email]);

  const updateStatus = (data) => {
    //console.log(status)
    if (data.RegistrationApproval === 1) {
      setStatus("Registration Approved");
    } else if (
      data.reSubmit &&
      data.reSubmitReason &&
      data.RegistrationApproval === 0
    ) {
      setStatus("ReSubmit");
      setShowReason(true);
    } else if (data.RegistrationApproval === 0 && !data.rejected) {
      setStatus("Waiting for Approval");
    } else if (data.rejected) {
      setStatus("Rejected");
      setShowReason(true);
    }
  };
//  console.log("hi", status);

  const updateLevelStatus = (data, reports, eventData) => {
    const level1Report = reports.find((report) => report.level === 1);
    const level2Report = reports.find((report) => report.level === 2);
    const level3Report = reports.find((report) => report.level === 3);
    const level4Report = reports.find((report) => report.level === 4);

    // Level 1 Status
    if (data.level1Approval === 0) {
       if (data.reSubmit === 1) {
        setLevel1Status("Document to be Resubmitted");
        setLevel1Reason(data.reSubmitReason || "N/A");
        setShowSubmitButton(eventData.isTeamLeader);
      } 
      else if (data.rejected) {
        setLevel1Status("Rejected");
        setLevel1Reason(data.rejected || "N/A");
        setShowSubmitButton(false);
      }
      else if(level1Report){
        setLevel1Status("Report Submitted");
        setShowSubmitButton(0)
      }
      else if (data.reSubmit === 0 && !data.rejected) {
        setLevel1Status("Report to be submitted");
        setShowSubmitButton(eventData.isTeamLeader);
      }
     
    } else {
      setLevel1Status("Report Reviewed");
      setShowSubmitButton(false);
    }

    // Level 2 Status
    if (eventData.levelCount > 1) {
      if (
        level2Report &&
        data.reSubmit === 0 &&
        !data.rejected &&
        data.level2Approval === 0
      ) {
        setLevel2Status("Report Submitted");
        setLevel2Reason(null);
        setShowSubmitButtonLevel2(false);
      } else if (
        data.level2Approval === 0 &&
        data.level1Approval === 1 &&
        !data.rejected &&
        !data.reSubmit
      ) {
        setLevel2Status("Report to be submitted");
        setShowSubmitButtonLevel2(eventData.isTeamLeader);
      } else if (
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1
      ) {
        setLevel2Status("Report Reviewed");
        setShowSubmitButtonLevel2(false);
      } else if (
        data.rejected &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1
      ) {
        setLevel2Status("Rejected");
        setLevel2Reason(data.rejected);
        setShowSubmitButtonLevel2(false);
      } else if (
        data.reSubmit &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1
      ) {
        setLevel2Status("Document to be Resubmitted");
        setLevel2Reason(data.reSubmitReason);
        setShowSubmitButtonLevel2(eventData.isTeamLeader);
      }
    }

    // Level 3 Status
    if (eventData.levelCount > 2) {
      if (
        level3Report &&
        data.reSubmit === 0 &&
        !data.rejected &&
        data.level3Approval === 0
      ) {
        setLevel3Status("Report Submitted");
        setLevel3Reason(null);
        setShowSubmitButtonLevel3(false);
      } else if (
        data.level3Approval === 0 &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        !data.rejected &&
        !data.reSubmit
      ) {
        setLevel3Status("Report to be submitted");
        setShowReason(false);
        setShowSubmitButtonLevel3(eventData.isTeamLeader);
      } else if (
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        data.level3Approval === 1
      ) {
        setLevel3Status("Report Reviewed");
        setShowSubmitButtonLevel3(false);
      } else if (
        data.rejected &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1
      ) {
        setLevel3Status("Rejected");
        setLevel3Reason(data.rejected);
        setShowSubmitButtonLevel3(false);
      } else if (
        data.reSubmit &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1
      ) {
        setLevel3Status("Document to be Resubmitted");
        setLevel3Reason(data.reSubmitReason);
        setShowSubmitButtonLevel3(eventData.isTeamLeader);
      }
    }

    // Level 4 Status
    if (eventData.levelCount > 3) {
      if (
        level4Report &&
        data.reSubmit === 0 &&
        !data.rejected &&
        data.level4Approval === 0
      ) {
        setLevel4Status("Report Submitted");
        setLevel4Reason(null);
        setShowSubmitButtonLevel4(false);
      } else if (
        data.level4Approval === 0 &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        data.level3Approval === 1 &&
        !data.rejected &&
        !data.reSubmit
      ) {
        setLevel4Status("Report to be submitted");
        setShowReason(false);
        setShowSubmitButtonLevel4(eventData.isTeamLeader);
      } else if (
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        data.level3Approval === 1 &&
        data.level4Approval === 1
      ) {
        setLevel4Status("Report Reviewed");
        setShowSubmitButtonLevel4(false);
      } else if (
        data.rejected &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        data.level3Approval === 1
      ) {
        setLevel4Status("Rejected");
        setLevel4Reason(data.rejected);
        setShowSubmitButtonLevel4(false);
      } else if (
        data.reSubmit &&
        data.RegistrationApproval === 1 &&
        data.level1Approval === 1 &&
        data.level2Approval === 1 &&
        data.level3Approval === 1
      ) {
        setLevel4Status("Document to be Resubmitted");
        setLevel4Reason(data.reSubmitReason);
        setShowSubmitButtonLevel4(eventData.isTeamLeader);
      }
    }
  };
  const handleSubmit = () => {
   // console.log("Submit button clicked");
  };

  return (
    <> <div className='title'>
    <Link to="/registeredevents">
        <FaArrowCircleLeft size={18} color="black"/>
        </Link>

        <div>
      <h2>Registration Details</h2>

      {/* Display team member details */}
      <div>
        <h3>Team Members</h3>
        {teamdetails.length > 0 ? (
          <ul>
            {teamdetails.map((member, index) => (
              <li key={index}>
                <strong>Name:</strong> {member.name} <br />
                <strong>Roll No:</strong> {member.rollNo} <br />
                <strong>Email:</strong> {member.email} <br />
                <strong>Department:</strong> {member.department} <br />
                <strong>Year:</strong> {member.year} <br />
                <strong>Team Leader:</strong> {member.isTeamLeader ? "Yes" : "No"} <br />
                <strong>Rewards:</strong> Level 1: {member.reward_level1}, 
                Level 2: {member.reward_level2}, 
                Level 3: {member.reward_level3}, 
                Level 4: {member.reward_level4}
              </li>
            ))}
          </ul>
        ) : (
          <p>No team members found.</p>
        )}
      </div>
    </div>
    <br></br>
      <h2>Registration Status</h2>
      </div>
      <div className="registration-status">
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Team Name</th>
              <th>Status</th>
              {(registrationData.reSubmit || registrationData.rejected) &&
                registrationData.RegistrationApproval === 0 &&
                showReason && <th>Reason</th>}
              {(registrationData.reSubmit || registrationData.rejected) &&
                registrationData.RegistrationApproval === 0 &&
                leader === true && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{registrationData.eventName || "N/A"}</td>
              <td>{registrationData.teamName || "N/A"}</td>
              <td>{status || "N/A"}</td>
              {(registrationData.reSubmit || registrationData.rejected) &&
                registrationData.RegistrationApproval === 0 &&
                showReason && (
                  <td className="reason">
                    {registrationData.rejected ||
                      registrationData.reSubmitReason ||
                      "N/A"}
                  </td>
                )}
              {registrationData.RegistrationApproval === 0 &&
                registrationData.reSubmit === 1 &&
                leader === true && (
                  <td>
                    <Link
                      to={`/reportSubmissionForm/${registrationData.eventName}`}
                    >
                      <button>Resubmit</button>
                    </Link>
                  </td>
                )}
            </tr>
          </tbody>
        </table>
        <br />
        {registrationData.RegistrationApproval === 1 && (
          <div className="level1">
            <h3>Level 1</h3>
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Status</th>
                  {registrationData.level1Approval === 0 &&
                    registrationData.RegistrationApproval === 1 &&
                    showReason && <th>Reason for Rejection</th>}
                  {showSubmitButton===1 && <th>Action</th>}
                  {data1?.reward_level1 > 0 && <th>Rewards Awarded</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Level 1</td>
                  <td>{level1Status || "N/A"}</td>
                  {registrationData.level1Approval === 0 &&
                    registrationData.RegistrationApproval === 1 &&
                    showReason && (
                      <td className="reason">{level1Reason || "N/A"}</td>
                    )}
                  {showSubmitButton===1 && (
                    <td className="action">
                      <Link
                        to={`/reportSubmissionForm/${registrationData.eventName}`}
                      >
                        <button onClick={handleSubmit}>Submit</button>
                      </Link>
                    </td>
                  )}
                  {data1?.reward_level1 > 0 && <td>{data1.reward_level1}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* //{console.log(data1)} */}
        
        {data1?.levelCount > 1 &&
          level1qualification === "Qualified for next Level" &&
          registrationData.level1Approval === 1 && (
            <div className="level2">
              <h3>Level 2</h3>
              <table>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Status</th>
                    {showReason && <th>Reason for Rejection</th>}
                    {showSubmitButtonLevel2 === 1 && <th>Action</th>}
                    {data1?.reward_level2 > 0 && <th>Rewards Awarded</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Level 2</td>
                    <td>{level2Status || "N/A"}</td>
                    {showReason && <td className="reason">{level2Reason}</td>}
                    {showSubmitButtonLevel2 === 1 && (
                      <td className="action">
                        <Link
                          to={`/reportSubmissionForm/${registrationData.eventName}`}
                        >
                          <button onClick={handleSubmit}>Submit</button>
                        </Link>
                      </td>
                    )}
                    {/* Conditionally render Rewards Awarded value */}
                    {data1?.reward_level2 > 0 && <td>{data1.reward_level2}</td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        {data1?.levelCount > 2 &&
          level2qualification === "Qualified for next Level" &&
          registrationData.level2Approval === 1 && (
            <div className="level3">
              <h3>Level 3</h3>
              <table>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Status</th>
                    {showReason && <th>Reason for Rejection</th>}
                    {showSubmitButtonLevel3 === 1 && <th>Action</th>}
                    {data1?.reward_level3 > 0 && <th>Rewards Awarded</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Level 3</td>
                    <td>{level3Status || "N/A"}</td>
                    {showReason && <td className="reason">{level3Reason}</td>}
                    {showSubmitButtonLevel3 === 1 && (
                      <td className="action">
                        <Link
                          to={`/reportSubmissionForm/${registrationData.eventName}`}
                        >
                          <button onClick={handleSubmit}>Submit</button>
                        </Link>
                      </td>
                    )}
                    {/* Conditionally render Rewards Awarded value */}
                    {data1?.reward_level3 > 0 && <td>{data1.reward_level3}</td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        {data1?.levelCount > 3 &&
          level3qualification === "Qualified for next Level" &&
          registrationData.level3Approval === 1 && (
            <div className="level4">
              <h3>Level 4</h3>
              <table>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Status</th>
                    {showReason && <th>Reason for Rejection</th>}
                    {showSubmitButtonLevel4 === 1 && <th>Action</th>}
                    {data1 &&
                      data1.reward_level4 !== 0 &&
                      data1.reward_level4 !== undefined && (
                        <th>Rewards Awarded</th>
                      )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Level 4</td>
                    <td>{level4Status || "N/A"}</td>
                    {showReason && (
                      <td className="reason">{level4Reason || "N/A"}</td>
                    )}
                    {showSubmitButtonLevel4 === 1 && (
                      <td className="action">
                        <Link
                          to={`/reportSubmissionForm/${registrationData.eventName}`}
                        >
                          <button onClick={handleSubmit}>Submit</button>
                        </Link>
                      </td>
                    )}
                    {data1 &&
                      data1.reward_level4 !== 0 &&
                      data1.reward_level4 !== undefined && (
                        <td>{data1.reward_level4}</td>
                      )}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
      </div>
    </>
  );
};

export default RegistrationStatus;
