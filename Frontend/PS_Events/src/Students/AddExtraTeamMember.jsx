import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AddExtraTeamMember.css";
import { UserContext } from "../UserContext";

const AddExtraTeamMember = () => {
  const {eventName} = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const initialMemberData = {
    name: "",
    rollNo: "",
    email: "",
    year: "",
    department: "",
  };

  const [memberData, setMemberData] = useState(initialMemberData);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [eligibleYear, setEligibleYear] = useState(null);
  const [criteriaId, setCriteriaId] = useState(null);
  const [departments, setDepartments] = useState(null);
  const [leaderRollNo, setLeaderRollNo] = useState(user.rollNo); // Assuming leaderRollNo is based on the logged-in user
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Fetch eligible year and criteria for the event
  useEffect(() => {
    const fetchEligibleYearAndCriteria = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/student/events/getEligibleYear/${eventName}`
        );
        const { eligibleYear, criteria_id, departments } = response.data;
        setEligibleYear(eligibleYear);
        setCriteriaId(criteria_id);
        setDepartments(departments);
      } catch (error) {
        console.error("Error fetching eligible year and criteria:", error);
      }
    };

    fetchEligibleYearAndCriteria();
  }, [user.eventName]);

  // Fetch eligible students based on year and criteria
  useEffect(() => {
    if (eligibleYear && criteriaId && departments) {
      const fetchEligibleStudents = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/student/eligible/${eligibleYear}/${criteriaId}/${departments}/${eventName}`
          );
          console.log("Hi");
          console.log(response.data);
          setEligibleStudents(response.data);
        } catch (error) {
          console.error("Error fetching eligible students:", error);
        }
      };
  
      fetchEligibleStudents();
    }
  }, [eligibleYear, criteriaId, departments, eventName]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStudentSelect = (rollNo) => {
    const selectedStudent = eligibleStudents.find(student => student.rollno === rollNo);
    if (selectedStudent) {
      setMemberData({
        name: selectedStudent.name,
        rollNo: selectedStudent.rollno,
        email: selectedStudent.email,
        year: selectedStudent.yearOfStudy,
        department: selectedStudent.department,
      });
      setSearchText(selectedStudent.rollno); // Update the searchText with the selected roll number
      setFilteredStudents([]); // Clear the filtered suggestions to hide the dropdown
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      const filtered = eligibleStudents.filter(
        (student) =>
          student.rollno.toLowerCase().includes(value.toLowerCase()) &&
          student.rollno !== leaderRollNo
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Include the event name in the member data before sending the request
      const finalMemberData = {
        ...memberData,
        eventName, // Add the event name to the data
      };
  
      const response = await fetch('http://localhost:8081/student/register/team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalMemberData), // Send the updated member data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
  
      alert("Team member added successfully!");
      navigate(`/registeredevents/registration-status/${eventName}`);
    } catch (error) {
      console.error('Error adding team member:', error);
      setError(error.message);
    }
  };
  
  const handleBack = () => {
    navigate(`/registeredevents/registration-status/${eventName}`);
  };

  return (
    <>
      <h2>Add Extra Team Member</h2>
      <div className="team-member-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="rollNo">
              Search Roll Number
              <p style={{ color: "red", fontSize: "15px", display: "inline" }}>
                *
              </p>
            </label>
            <input
              type="text"
              id="searchRollNo"
              name="searchRollNo"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search by Roll Number"
              autoComplete="off"
            />
            {filteredStudents.length > 0 && (
              <ul className="suggestions">
                {filteredStudents.map((student) => (
                  <li key={student.rollno} onClick={() => handleStudentSelect(student.rollno)}>
                    {student.rollno} - {student.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="name">Name<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></label>
            <input
              type="text"
              id="name"
              name="name"
              value={memberData.name}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></label>
            <input
              type="email"
              id="email"
              name="email"
              value={memberData.email}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year of Study<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></label>
            <input
              type="text"
              id="year"
              name="year"
              value={memberData.year}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></label>
            <input
              type="text"
              id="department"
              name="department"
              value={memberData.department}
              onChange={handleChange}
              readOnly
              required
            />
          </div>
          <div className="confirmation-checkbox">
            <input
              type="checkbox"
              id="confirm"
              name="confirm"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <label htmlFor="confirm">I confirm that all the entered details are correct.<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></label>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="form-buttons">
            <button type="button" onClick={handleBack} style={{ backgroundColor: "gray" }}>Back</button>
            {isConfirmed && <button type="button" onClick={handleFinalSubmit}>Submit</button>}
          </div>
        </form>
      </div>
    </>
  );
};

export default AddExtraTeamMember;
