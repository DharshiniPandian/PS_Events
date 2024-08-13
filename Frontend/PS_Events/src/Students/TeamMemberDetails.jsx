import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./TeamMemberDetails.css";
import { UserContext } from "../UserContext";

const TeamMemberDetails = ({ formData, setFormData }) => {
  const { memberIndex } = useParams();
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
  const [selectedStudents, setSelectedStudents] = useState(
    formData.teamMembers.map((member) => member.rollNo)
  );
  const [eligibleYear, setEligibleYear] = useState(null);
  const [criteriaId, setCriteriaId] = useState(null);
  const [departments, setDepartments] = useState(null);
  const [leaderRollNo, setLeaderRollNo] = useState(formData.initialData.rollNo);

  // Fetch eligible year and criteria for the event
  useEffect(() => {
    const fetchEligibleYearAndCriteria = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/student/events/getEligibleYear/${formData.initialData.eventName}`
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
  }, [formData.initialData.eventName]);

  // Fetch eligible students based on year and criteria
  useEffect(() => {
    if (eligibleYear && criteriaId && departments) {
      const fetchEligibleStudents = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/student/eligible/${eligibleYear}/${criteriaId}/${departments}`
          );
          setEligibleStudents(response.data);
        } catch (error) {
          console.error("Error fetching eligible students:", error);
        }
      };

      fetchEligibleStudents();
    }
  }, [eligibleYear, criteriaId, departments, formData.initialData.eventName]);

  useEffect(() => {
    // Reset the memberData to initialMemberData when memberIndex changes
    // console.log(formData)
    // console.log(memberIndex)
    const index = parseInt(memberIndex, 10) - 1;
    if (formData.teamMembers[index]) {
      setMemberData(formData.teamMembers[index]);
    } else {
      setMemberData(initialMemberData); // Reset to initial if no data found
    }
  }, [memberIndex, formData.teamMembers]);

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
      const newMemberData = {
        name: selectedStudent.name,
        rollNo: selectedStudent.rollno,
        email: selectedStudent.email,
        year: selectedStudent.yearOfStudy,
        department: selectedStudent.department,
      };
      setMemberData(newMemberData);
      setSearchText(selectedStudent.rollno); // Update the searchText with the selected roll number
      setFilteredStudents([]); // Clear the filtered suggestions to hide the dropdown

      const updatedMembers = [...formData.teamMembers];
      updatedMembers[parseInt(memberIndex, 10) - 1] = newMemberData;
      setFormData({ ...formData, teamMembers: updatedMembers });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      const filtered = eligibleStudents.filter(
        (student) =>
          student.rollno.toLowerCase().includes(value.toLowerCase()) &&
          student.rollno !== leaderRollNo &&
          !selectedStudents.includes(student.rollno)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedMembers = [...formData.teamMembers];
    updatedMembers[parseInt(memberIndex, 10) - 1] = memberData;
    setFormData({ ...formData, teamMembers: updatedMembers });

    setMemberData(initialMemberData);

    setSelectedStudents([...selectedStudents, memberData.rollNo]);

    const teamSize = formData.initialData.teamSize - 1; // Adjusted for team members
    const nextIndex = parseInt(memberIndex, 10) + 1;

    if (nextIndex <= teamSize) {
      navigate(`/team-members/${nextIndex}`);
    } else {
      navigate("/verify");
    }
  };

  const handleBack = () => {
    const prevIndex = parseInt(memberIndex, 10) - 1;
    if (prevIndex > 0) {
      navigate(`/team-members/${prevIndex}`);
    } else {
      const eventName = formData.initialData.eventName;
      console.log(formData);
      navigate(`/eventregister/${eventName}`);
    }
  };

  // Exclude the team leader from the available students
  const availableStudents = eligibleStudents.filter(
    (student) =>
      student.rollno !== leaderRollNo &&
      !selectedStudents.includes(student.rollno)
  );

  return (
    <>
      <h2>Team Member {memberIndex}</h2>
      <div className="team-member-form">
        <form onSubmit={handleSubmit}>
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
                {filteredStudents.map(student => (
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
          <div className="form-buttons">
            <button
              type="button"
              style={{ backgroundColor: "gray" }}
              onClick={handleBack}
            >
              Back
            </button>
            <button type="submit">Next</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TeamMemberDetails;
