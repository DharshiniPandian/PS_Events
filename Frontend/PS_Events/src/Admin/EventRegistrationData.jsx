import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./EventRegistrationData.css";
import { LuEye } from "react-icons/lu";
import * as XLSX from "xlsx";

const EventRegistrationData = ({ name, eventid }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerms, setSearchTerms] = useState({
    teamName: "",
    teamLeader: "",
    rollNo: "",
    level: "",
    status: "",
  });
  const [levelReports, setLevelReports] = useState([]);
  const [level1qualification, setLevel1qualification] = useState(null);
  const [level2qualification, setLevel2qualification] = useState(null);
  const [level3qualification, setLevel3qualification] = useState(null);

  const [eventStatus, setEventStatus] = useState({});
  const [reportDetails, setReportDetails] = useState({});

  const location = useLocation();

  // Function to fetch data from the server
  const fetchData = async () => {
    try {
      // console.log(name);
      const response = await axios.get(
        `http://localhost:8081/events/${name}/teams`
      );
      const teamsData = response.data;
      // console.log("Fetched Teams Data:", teamsData);

      const updatedData = await Promise.all(
        teamsData.map(async (team) => {
          if (!team.teamLeader) {
            const leaderResponse = await axios.get(
              `http://localhost:8081/student/teams/${team.eventId}/${team.teamName}`
            );
            return {
              ...team,
              teamLeader: leaderResponse.data.teamLeader,
              rollNo: leaderResponse.data.rollNo,
            };
          }
          return team;
        })
      );

      // console.log(updatedData);

      const id = updatedData[0]?.eventId; // Make sure updatedData is not empty
      const reportResponse = await axios.get(
        `http://localhost:8081/student/reports/${id}`
      );
      const reports = reportResponse.data;

      // Update level qualifications based on the reports
      console.log(reports)
      if (reports.length > 0) setLevel1qualification(reports[0]?.eventStatus);
      if (reports.length > 1) setLevel2qualification(reports[1]?.eventStatus);
      if (reports.length > 2) setLevel3qualification(reports[2]?.eventStatus);
      console.log(level1qualification)
      setLevelReports(reports);
      setData(updatedData);
      setFilteredData(updatedData);
      // console.log(levelReports)
      // console.log(updatedData)
      // console.log(filteredData)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [name]);


  useEffect(() => {
    fetchEventStatuses();
    fetchReportDetails();
}, [filteredData]);

const fetchEventStatuses = async () => {
  try {
      const statuses = {};
      for (const item of filteredData) {
          const response = await axios.get(`http://localhost:8081/events/report/${item.eventId}`);
          statuses[item.eventId] = response.data.eventStatus;
      }
      setEventStatus(statuses);
  } catch (error) {
      console.error('Error fetching event statuses:', error);
  }
};




  const fetchReportDetails = async () => {
    try {
        const reports = {};
        for (const item of filteredData) {
            const response = await axios.get(`http://localhost:8081/events/report/${item.eventId}`);
            reports[item.eventId] = response.data;
        }
        setReportDetails(reports);
    } catch (error) {
        console.error('Error fetching report details:', error);
    }
};
  // Function to handle search input change
  const handleSearchChange = (event, column) => {
    const value = event.target.value.toLowerCase();
    setSearchTerms((prevTerms) => ({
      ...prevTerms,
      [column]: value,
    }));

    const filtered = data.filter(
      (item) =>
        item.teamName &&
        item.teamName.toLowerCase().includes(searchTerms.teamName) &&
        item.teamLeader &&
        item.teamLeader.toLowerCase().includes(searchTerms.teamLeader) &&
        item.rollNo &&
        item.rollNo.toLowerCase().includes(searchTerms.rollNo) &&
        getLevel(item).toLowerCase().includes(searchTerms.level) &&
        getStatus(item).toLowerCase().includes(searchTerms.status)
    );
    setFilteredData(filtered);
  };

  const getLevel = (item) => {
    if (item.RegistrationApproval === 0) return "Level 0"; // Initial status
  console.log(item)
    let highestQualifiedLevel = 0;
  
    // Determine the highest level based on qualifications
    console.log("hi",level1qualification === "Qualified for next Level",level1qualification)
    if (item.level1Approval === 1 || item.RegistrationApproval === 1) highestQualifiedLevel = 1;
    if (level1qualification === "Qualified for next Level") highestQualifiedLevel = 2;
    if (level2qualification === "Qualified for next Level") highestQualifiedLevel = 3;
    if (level3qualification === "Qualified for next Level") highestQualifiedLevel = 4;
    console.log(highestQualifiedLevel)
    // Check if the student is participating in the current level
    const isParticipating = (level) => {
      if (level === 1 && item.level1Approval === 0) return true;
      if (level === 2 && item.level2Approval === 0 && level1qualification === "Qualified for next Level") return true;
      if (level === 3 && item.level3Approval === 0 && level2qualification === "Qualified for next Level") return true;
      if (level === 4 && item.level4Approval === 0 && level3qualification === "Qualified for next Level") return true;
      return false;
    };
    console.log(highestQualifiedLevel)
  
    // If participating in a higher level, show that level
    if (item.levelCount >= highestQualifiedLevel && isParticipating(highestQualifiedLevel)) {
      return `Level ${highestQualifiedLevel}`;
    }
  
    // Default to the highest level based on levelCount
    const displayedLevel = Math.min(highestQualifiedLevel, item.levelCount);
    return `Level ${displayedLevel}`;
};


  const getStatus = (item) => {
    // Check if the document needs to be resubmitted
    if (item.reSubmit === 1) return "Document to be resubmitted";
    
    // Check if the registration is still pending approval
    if (item.RegistrationApproval === 0 && !item.rejected) return "Waiting for Approval";
    
    // Check if the registration was rejected
    if (item.rejected) return "Rejected";
    
    // Determine the status based on the current level
    const currentLevel = parseInt(getLevel(item).split(" ")[1], 10);
    
    // Return status based on the level
    return getLevelStatus(item, currentLevel);
  };
  
//   const getStatus = (item) => {
//     if (item.level1 === 0) {
//         return (item.rejected === "NULL" || item.rejected === null || item.rejected === undefined) ? "Waiting for Approval" : "Rejected";
//     } else if (item.level1 === 1 && item.level2 === 0) {
//         return "Report to be Submitted";
//     } else if (item.level1 === 1 && item.level2 === 1 && item.level2Approval === 1) {
//         return "Report Reviewed";
//     } else {
//         return "Report yet to be reviewed";
//     }
// };
  const getLevelStatus = (item, level) => {
    const levelStatuses = {
      1: item.level1Approval,
      2: item.level2Approval,
      3: item.level3Approval,
      4: item.level4Approval,
    };
    
    const levelQualifications = {
      1: level1qualification,
      2: level2qualification,
      3: level3qualification,
      4: "Qualified for next Level", // Add qualification logic for level 4 if needed
    };
    
    const status = levelStatuses[level];
    const qualification = levelQualifications[level];
    const quali=levelQualifications[level-1];

    // console.log("hi")
    // console.log(status)
    // console.log(qualification)
    // console.log(levelQualifications)
    // console.log(levelReports[level-1].level)
    
    // Determine status based on level and qualification
    if (item.reSubmit === 1) return "Document to be resubmitted";
    if (item.rejected) return "Rejected";
    if (status === 1 && (qualification !== "Qualified for next Level" || level===4 || level===item.levelCount)) return "Report Reviewed";
    if (level && levelReports[level-1]  && levelReports[level-1].level===level) return "Report Submitted";
    if (status === 0 ) return "Report to be Submitted";
    return "Unknown Status";
  };
  
   
  
  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  const fetchTeamDetails = async (eventId, teamName) => {
    try {
        const response = await axios.get(`http://localhost:8081/events/${eventId}/teams/${teamName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching team details:', error);
        return null;
    }
};
const downloadExcel = async () => {
  const dataWithDetails = await Promise.all(
      filteredData.map(async (item) => {
          const teamDetails = await fetchTeamDetails(item.eventId, item.teamName);
          return {
              ...item,
              teamDetails,
              eventStatus: eventStatus[item.eventId] || 'Unknown',
              reportDetails: reportDetails[item.eventId] || {}
          };
      })
  );

  const worksheetData = dataWithDetails.flatMap((item, index) => {
      const members = item.teamDetails?.members || [];
      const totalTeamMembers = members.length;
      const levelCount = item.levelCount || 4; // Default to 4 levels if not specified
      const levels = Array.from({ length: levelCount }, (_, i) => i + 1); // Create an array [1, 2, 3, ..., levelCount]

      return members.map((member, memberIndex) => {
          const memberData = {
              SNo: index * totalTeamMembers + memberIndex + 1, // Serial Number
              TeamName: item.teamName,
              Name: member.name,
              RollNo: member.rollNo,
              Department: member.department,
              TeamLeader: member.isTeamLeader,
              TotalTeamMembers: totalTeamMembers,
              Level: getLevel(item),
              Status: getStatus(item),
          };

          levels.forEach((level) => {
              // Use the provided reward directly from member data
              memberData[`Level${level}Reward`] = member[`reward_level${level}`] || 0;
          });

          return memberData;
      });
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registration Data");
  XLSX.writeFile(workbook, "RegistrationData.xlsx");
};



  return (
    <div className="registration-data">
       <button onClick={downloadExcel} className="download-button">Download</button>
      <div className="registration-container">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <br />
                  <br />
                  S.No
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search Team Name"
                    value={searchTerms.teamName}
                    onChange={(e) => handleSearchChange(e, "teamName")}
                  />
                  <br />
                  <br />
                  Team Name
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search Team Leader"
                    value={searchTerms.teamLeader}
                    onChange={(e) => handleSearchChange(e, "teamLeader")}
                  />
                  <br />
                  <br />
                  Team Leader
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search Roll No"
                    value={searchTerms.rollNo}
                    onChange={(e) => handleSearchChange(e, "rollNo")}
                  />
                  <br />
                  <br />
                  Roll No
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search Level"
                    value={searchTerms.level}
                    onChange={(e) => handleSearchChange(e, "level")}
                  />
                  <br />
                  <br />
                  Level
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search Status"
                    value={searchTerms.status}
                    onChange={(e) => handleSearchChange(e, "status")}
                  />
                  <br />
                  <br />
                  Status
                </th>
                <th>
                  <br />
                  <br />
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {highlightText(item.teamName || "", searchTerms.teamName)}
                  </td>
                  <td>
                    {highlightText(
                      item.teamLeader || "",
                      searchTerms.teamLeader
                    )}
                  </td>
                  <td>
                    {highlightText(item.rollNo || "", searchTerms.rollNo)}
                  </td>
                  <td>
                    {highlightText(getLevel(item) || "", searchTerms.level)}
                  </td>
                  <td>{highlightText(getStatus(item), searchTerms.status)}</td>
                  <td>
                    <Link
                      to={`/${eventid}/team-details/${item.eventId}/${item.teamName}/`}
                      className={
                        location.pathname === `/team/${item.teamName}`
                          ? "active"
                          : ""
                      }
                    >
                      <LuEye size={23} color="blue" className="eye-icon" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationData;