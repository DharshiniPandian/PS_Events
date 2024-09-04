import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./RegistrationStatus.css";
import { FaArrowCircleLeft } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuEye } from "react-icons/lu";

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
  const [teamdetails, setTeamdetails] = useState(null);
  const [eventdetails, setEventdetails] = useState(null);
  const [showaddButton, setShowaddButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [removalReason, setRemovalReason] = useState("");

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        // Fetch registration status
        const response = await axios.get(
          `http://localhost:8081/student/registration-status/${eventName}/${user.email}`
        );
        const registrationData = response.data;
        console.log("Registration Status Data:", registrationData);

        if (!registrationData || typeof registrationData !== "object") {
          throw new Error("Invalid data received");
        }

        setRegistrationData(registrationData);
        updateStatus(registrationData);

        if (registrationData.rejected || registrationData.reSubmitReason) {
          setShowReason(true);
        }

        let eventId;

        // Proceed if registration is approved or needs resubmission
        if (
          registrationData.RegistrationApproval === 1 ||
          registrationData.reSubmit === 1 ||
          registrationData.RegistrationApproval === 0
        ) {
          const eventResponse = await axios.get(
            `http://localhost:8081/student/events/getEventData/${eventName}/${user.email}`
          );
          const eventData = eventResponse.data;
          console.log("Event Data:", eventData);
          setData1(eventData);

          if (eventData.isTeamLeader === 1) setLeader(true);

          if (
            eventData.isTeamLeader === 1 &&
            registrationData.RegistrationApproval === 1 &&
            !registrationData.rejected &&
            registrationData.reSubmit === 0 &&
            registrationData.level1Approval === 0
          ) {
            setShowSubmitButton(true);
          }
          // console.log(registrationData);

          eventId = registrationData.eventId;
          const id = registrationData.eventId;
          const reportResponse = await axios.get(
            `http://localhost:8081/student/reports/${id}`
          );
          const reports = reportResponse.data;
          console.log("Level Reports:", reports);
          setLevelReports(reports);
          reports.forEach((report, index) => {
            if (index === 0) setLevel1qualification(report.eventStatus);
            if (index === 1) setLevel2qualification(report.eventStatus);
            if (index === 2) setLevel3qualification(report.eventStatus);
          });

          updateLevelStatus(registrationData, reports, eventData);
        }

        const teamResponse = await axios.get(
          `http://localhost:8081/student/team_members/${registrationData.eventName}`
        );
        setTeamdetails(teamResponse.data);
        console.log("Team members:", teamResponse.data);

        // Fetch event details (this can be moved inside the condition block if it depends on registrationData)
        if (registrationData.eventName) {
          const eventDetailsResponse = await axios.get(
            `http://localhost:8081/student/event_details/${registrationData.eventName}`
          );
          const eventDetails = eventDetailsResponse.data;
          setEventdetails(eventDetails);
          console.log("Event details:", eventDetails);

          if (registrationData.teamSize < eventDetails[0].teamSize) {
            setShowaddButton(true);
          }
          console.log("button", showaddButton);
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


  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setRemovalReason("");
    setSelectedMember(null);
  };

  const handleReasonChange = (e) => {
    setRemovalReason(e.target.value);
  };

  const handleSubmitDelete = async () => {
    if (removalReason.trim() === "") {
      alert("Please enter a reason for removal.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8081/student/remove-team-member",
        {
          eventId: selectedMember.eventId, // Ensure eventId is part of selectedMember or adjust accordingly
          rollNo: selectedMember.rollNo,
          reason: removalReason,
          name: selectedMember.name,
        }
      );

      if (response.data.message) {
        alert(response.data.message); // Display success message
      }
    } catch (error) {
      console.error("There was an error logging the deletion request:", error);
      alert("Failed to sent deletion request. Please try again.");
    }

    // After the request is made
    handlePopupClose();
  };

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
      } else if (data.rejected) {
        setLevel1Status("Rejected");
        setLevel1Reason(data.rejected || "N/A");
        setShowSubmitButton(false);
      } else if (level1Report) {
        setLevel1Status("Report Submitted");
        setShowSubmitButton(0);
      } else if (data.reSubmit === 0 && !data.rejected) {
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

  const getlevel = () => {
    var level = 0;
    if (data1?.reward_level4 !== 0) return 4;
    else if (data1?.reward_level3 !== 0) return 3;
    else if (data1?.reward_level2 !== 0) return 2;
    else if (data1?.reward_level1 !== 0) return 1;
    else return 0;
  };

  return (
    <>
      <div className="title">
        <Link to="/registeredevents">
          <FaArrowCircleLeft size={18} color="black" />
        </Link>
        <h2>Event Registration</h2>
      </div>
      <div className="registration-status">
        <div className="details">
          <h2>Registration Details</h2>
          <p>Event Name: {registrationData.eventName}</p>
          <p>Team Name: {registrationData.teamName}</p>
          <p>Team Size: {registrationData.teamSize}</p>
          <p>Project Title: {registrationData.projectTitle}</p>
          <p>Levels Completed: {getlevel()}</p>

          <div className="details">
            <h2>Team Leader Details</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {teamdetails && teamdetails.length > 0 ? (
                    teamdetails
                      .filter((member) => member.isTeamLeader)
                      .map((member, index) => (
                        <tr key={index}>
                          <td>{1}</td>
                          <td>{member.name}</td>
                          <td>{member.rollNo}</td>
                          <td>{member.email}</td>
                          <td>{member.department}</td>
                          <td>{member.year}</td>
                          <td>Yes</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="7">No team leader found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h2>Active Team Members</h2>
            {showaddButton && data1?.isTeamLeader === 1 && (
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <Link to={`/registeredevents/AddExtraTeamMember/${eventName}`}>
                  <button>Add team member</button>
                </Link>
              </div>
            )}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Active</th>
                    {data1?.isTeamLeader === 1 && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {teamdetails && teamdetails.length > 0 ? (
                    teamdetails
                      .filter(
                        (member) =>
                          !member.isTeamLeader &&
                          (member.active === 1 || member.active === -2)
                      )
                      .map((member, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{member.name}</td>
                          <td>{member.rollNo}</td>
                          <td>{member.email}</td>
                          <td>{member.department}</td>
                          <td>{member.year}</td>
                          <td>Yes</td>
                          {data1?.isTeamLeader === 1 && (
                            <td>
                              {member.active === -2 ? (
                                <span>Request Sent</span>
                              ) : (
                                <MdDelete
                                  size={20}
                                  color="red"
                                  onClick={() => handleDeleteClick(member)}
                                  style={{ cursor: "pointer" }}
                                />
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={data1?.isTeamLeader === 1 ? "8" : "7"}>
                        No active team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h2>Inactive Team Members</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {teamdetails &&
                  teamdetails.filter(
                    (member) =>
                      !member.isTeamLeader &&
                      (member.active === 0 || member.active === -1)
                  ).length > 0 ? (
                    teamdetails
                      .filter(
                        (member) =>
                          !member.isTeamLeader &&
                          (member.active === 0 || member.active === -1)
                      )
                      .map((member, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{member.name}</td>
                          <td>{member.rollNo}</td>
                          <td>{member.email}</td>
                          <td>{member.department}</td>
                          <td>{member.year}</td>
                          <td>
                            {member.active === 0
                              ? "No"
                              : member.active === -1
                              ? "Addition Request Sent"
                              : "Unknown"}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No inactive team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showPopup && (
              <div className="overlay">
                <div className="rejection-popup">
                  <h3>Remove Team Member</h3>
                  <p>Reason for removing {selectedMember?.rollNo}:</p>
                  <textarea
                    className="te"
                    value={removalReason}
                    onChange={handleReasonChange}
                    placeholder="Enter removal reason"
                  />
                  <div className="popup-buttons">
                    <button
                      onClick={handleSubmitDelete}
                      className="submit-button"
                    >
                      Submit
                    </button>
                    <button
                      onClick={handlePopupClose}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <br></br>

      <div className="registration-status">
        <div>
          <h2>Registration Status</h2>
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
                {registrationData.reSubmit !== 1 && <th>View</th>}
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
                        to={`/registeredevents/reSubmitRegisteration/${registrationData.eventName}`}
                      >
                        <button>Resubmit</button>
                      </Link>
                    </td>
                  )}
                {registrationData.reSubmit !== 1 && (
                  <td>
                    <Link
                      to={`/registeredevents/registration-details/${registrationData.eventName}`}
                    >
                      <LuEye size={23} color="blue" className="eye-icon" />
                    </Link>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
          <br />
          {registrationData.RegistrationApproval === 1 &&
            (data1?.active === 1 || data1?.reward_level1 !== 0) && (
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
                      {showSubmitButton === 1 && <th>Action</th>}
                      {data1?.reward_level1 > 0 && <th>Rewards Awarded</th>}
                      {registrationData.reSubmit !== 1 &&
                        registrationData.RegistrationApproval === 1 &&
                        level1Status !== "Report to be submitted" && (
                          <th>View</th>
                        )}
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
                      {showSubmitButton === 1 && (
                        <td className="action">
                          <Link
                            to={`/registeredevents/reportSubmissionForm/${registrationData.eventName}`}
                          >
                            <button onClick={handleSubmit}>Submit</button>
                          </Link>
                        </td>
                      )}
                      {data1?.reward_level1 > 0 && (
                        <td>{data1.reward_level1}</td>
                      )}
                      {registrationData.reSubmit !== 1 &&
                        registrationData.RegistrationApproval === 1 &&
                        level1Status !== "Report to be submitted" && (
                          <td>
                            <Link
                              to={`/registeredevents/report-details/${registrationData.eventName}/1`}
                            >
                              <LuEye
                                size={23}
                                color="blue"
                                className="eye-icon"
                              />
                            </Link>
                          </td>
                        )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          {/* //{console.log(data1)} */}

          {data1?.levelCount > 1 &&
            (data1?.active === 1 || data1?.reward_level2 !== 0) &&
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
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level1Approval === 1 &&
                        level2Status !== "Report to be submitted" && (
                          <th>View</th>
                        )}
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
                            to={`/registeredevents/reportSubmissionForm/${registrationData.eventName}`}
                          >
                            <button onClick={handleSubmit}>Submit</button>
                          </Link>
                        </td>
                      )}
                      {/* Conditionally render Rewards Awarded value */}
                      {data1?.reward_level2 > 0 && (
                        <td>{data1.reward_level2}</td>
                      )}
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level1Approval === 1 &&
                        level2Status !== "Report to be submitted" && (
                          <td>
                            <Link
                              to={`/registeredevents/report-details/${registrationData.eventName}/2`}
                            >
                              <LuEye
                                size={23}
                                color="blue"
                                className="eye-icon"
                              />
                            </Link>
                          </td>
                        )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          {data1?.levelCount > 2 &&
            (data1?.active === 1 || data1?.reward_level3 !== 0) &&
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
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level2Approval === 1 &&
                        level3Status !== "Report to be submitted" && (
                          <th>View</th>
                        )}
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
                            to={`/registeredevents/reportSubmissionForm/${registrationData.eventName}`}
                          >
                            <button onClick={handleSubmit}>Submit</button>
                          </Link>
                        </td>
                      )}
                      {/* Conditionally render Rewards Awarded value */}
                      {data1?.reward_level3 > 0 && (
                        <td>{data1.reward_level3}</td>
                      )}
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level2Approval === 1 &&
                        level3Status !== "Report to be submitted" && (
                          <td>
                            <Link
                              to={`/registeredevents/report-details/${registrationData.eventName}/3`}
                            >
                              <LuEye
                                size={23}
                                color="blue"
                                className="eye-icon"
                              />
                            </Link>
                          </td>
                        )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          {data1?.levelCount > 3 &&
            (data1?.active === 1 || data1?.reward_level4 !== 0) &&
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
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level3Approval === 1 &&
                        level4Status !== "Report to be submitted" && (
                          <th>View</th>
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
                            to={`/registeredevents/reportSubmissionForm/${registrationData.eventName}`}
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
                      {registrationData.reSubmit !== 1 &&
                        registrationData.level3Approval === 1 &&
                        level4Status !== "Report to be submitted" && (
                          <td>
                            <Link
                              to={`/registeredevents/report-details/${registrationData.eventName}/4`}
                            >
                              <LuEye
                                size={23}
                                color="blue"
                                className="eye-icon"
                              />
                            </Link>
                          </td>
                        )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default RegistrationStatus;
