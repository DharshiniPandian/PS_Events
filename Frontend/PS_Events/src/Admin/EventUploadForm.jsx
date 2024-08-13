import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventUploadForm.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";

const departments = [
  "Agriculture Engineering",
  "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning",
  "Information Technology",
  "Computer Science and Engineering",
  "Computer Technology",
  "Computer Science and Business System",
  "Computer Science and Design",
  "Information Science Engineering",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Food Technology",
  "Aeronotical Engineering",
  "Fasion Design",
  "Bio Technology",
];

const years = ["1", "2", "3", "4"];

function EventUploadForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventNotice, setEventNotice] = useState(null);
  const [eventStartDate, setEventStartDate] = useState(null);
  const [eventEndDate, setEventEndDate] = useState(null);
  const [registrationStartDate, setRegistrationStartDate] = useState(null);
  const [registrationEndDate, setRegistrationEndDate] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [teamSize, setTeamSize] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventMode, setEventMode] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [eligibleYears, setEligibleYears] = useState([]);
  const [testTitles, setTestTitles] = useState({});
  const [levels, setLevels] = useState({});
  const [selectedTestTitles, setSelectedTestTitles] = useState({});
  const [selectedLevels, setSelectedLevels] = useState({});
  const [levelCount, setLevelCount] = useState(0);
  const [descriptions, setDescriptions] = useState([]);
  const [rewards, setRewards] = useState([]);

  const navigate = useNavigate();

  const handleCheckboxChangedept = (department) => {
    setSelectedDepartments((prevState) =>
      prevState.includes(department)
        ? prevState.filter((dep) => dep !== department)
        : [...prevState, department]
    );
  };

  const handleCheckboxChange = (setFunction, value) => {
    setFunction((prevState) =>
      prevState.includes(value)
        ? prevState.filter((item) => item !== value)
        : [...prevState, value]
    );
  };

  const handleLevelCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setLevelCount(count);

    // Initialize descriptions and rewards arrays with empty strings
    const initialDescriptions = Array(count).fill("");
    const initialRewards = Array(count).fill("");
    setDescriptions(initialDescriptions);
    setRewards(initialRewards);
  };

  const handleDescriptionChange = (index, value) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleRewardChange = (index, value) => {
    const newRewards = [...rewards];
    newRewards[index] = value;
    setRewards(newRewards);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = "Event Name is required";
    if (!description) newErrors.description = "Event Description is required";
    if (!eventStartDate)
      newErrors.eventStartDate = "Event Start Date is required";
    if (!eventEndDate) newErrors.eventEndDate = "Event End Date is required";
    if (!registrationStartDate)
      newErrors.registrationStartDate = "Registration Start Date is required";
    if (!registrationEndDate)
      newErrors.registrationEndDate = "Registration End Date is required";
    if (eventStartDate && eventEndDate && eventStartDate >= eventEndDate)
      newErrors.eventEndDate = "Event End Date must be after Start Date";
    if (
      registrationStartDate &&
      registrationEndDate &&
      registrationStartDate >= registrationEndDate
    )
      newErrors.registrationEndDate =
        "Registration End Date must be after Start Date";
    if (selectedDepartments.length === 0)
      newErrors.selectedDepartments =
        "At least one department must be selected";
    if (!teamSize) newErrors.teamSize = "Team Size is required";
    if (!eventLink) newErrors.eventLink = "Event Link is required";
    if (!eventMode) newErrors.eventMode = "Event Mode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Fetch test titles based on selected eligible years
    eligibleYears.forEach((year) => {
      if (!testTitles[year]) {
        fetchTestTitles(year);
      }
    });
  }, [eligibleYears]);

  useEffect(() => {
    // Fetch levels based on selected eligible years and test titles
    Object.keys(selectedTestTitles).forEach((year) => {
      if (selectedTestTitles[year]) {
        fetchLevels(year, selectedTestTitles[year]);
      }
    });
  }, [selectedTestTitles]);

  const fetchTestTitles = async (year) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/criteria/testTitles/${year}`
      );
      setTestTitles((prev) => ({ ...prev, [year]: response.data }));
    } catch (error) {
      console.error("Error fetching test titles:", error);
    }
  };

  const fetchLevels = async (year, testTitle) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/criteria/levels/${year}/${testTitle}`
      );
      const levels = response.data;
      setLevels((prev) => ({
        ...prev,
        [year]: { ...prev[year], [testTitle]: levels },
      }));
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    const eventData = new FormData();
    eventData.append("name", name);
    eventData.append("description", description);
    eventData.append(
      "eventStartDate",
      eventStartDate ? eventStartDate.toISOString().split("T")[0] : ""
    );
    eventData.append(
      "eventEndDate",
      eventEndDate ? eventEndDate.toISOString().split("T")[0] : ""
    );
    eventData.append(
      "registrationStartDate",
      registrationStartDate ? registrationStartDate.toISOString().split("T")[0] : ""
    );
    eventData.append(
      "registrationEndDate",
      registrationEndDate ? registrationEndDate.toISOString().split("T")[0] : ""
    );
    eventData.append("departments", selectedDepartments.join(","));
    eventData.append("teamSize", teamSize);
    eventData.append("eventLink", eventLink);
    eventData.append("eventMode", eventMode);
    eventData.append("eligibleYears", eligibleYears.join(","));
  
    // Append criteria details
    const criteria = eligibleYears.map((year) => ({
      year,
      testTitle: selectedTestTitles[year] || "",
      level: selectedLevels[year] || "",
    }));
  
    // Append criteria data as a JSON string
    eventData.append("criteria", JSON.stringify(criteria));
  
    // Append files if selected
    if (eventNotice) {
      eventData.append("eventNotice", eventNotice, eventNotice.name);
    }
    if (eventImage) {
      eventData.append("eventImage", eventImage, eventImage.name);
    }
  
    // Append level count, descriptions, and rewards as JSON strings
    eventData.append("levelCount", levelCount);
    eventData.append("descriptions", JSON.stringify(descriptions));
    eventData.append("rewards", JSON.stringify(rewards));
  
    axios
      .post("http://localhost:8081/events/upload", eventData)
      .then((response) => {
       // console.log(response.data);
        alert("Event created successfully");
        navigate("/events");
      })
      .catch((error) => {
        if(error.message==="Event name already exists"){
          alert("Event name already exists")
        }
        else if (error.response) {
          console.error("Error response:", error.response);

        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      });
  };
  
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (file && !validImageTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (jpg, jpeg, or png).");
      setEventImage(null);
    } else {
      setImageError("");
      setEventImage(file);
    }
  };

  return (
    <>
     <div className="title">
        <Link to={`/events`}>
          <FaArrowCircleLeft size={28} color="black"/>
        </Link>
      <h1>Upload Event Details</h1>
      </div>
      <div className="eventUploadForm">
        <form className="uploadform" onSubmit={handleSubmit}>
          <label>
          <p style={{display: "inline"}}>Event Name:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
              type="text"
              placeholder="Enter Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p className="error" style={{ color: "red" }}>
                {errors.name}
              </p>
            )}
          </label>
          <label>
          <p style={{display: "inline"}}>Event Description:<p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <textarea
              className="para"
              placeholder="Enter Event Description with Address."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {errors.description && (
              <p className="error" style={{ color: "red" }}>
                {errors.description}
              </p>
            )}
          </label>
          <div className="register-dates">
            <label>
            <p style={{display: "inline"}}>Registration Start Date: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <DatePicker
                className="box"
                selected={registrationStartDate}
                onChange={(date) => setRegistrationStartDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                required
              />
              {errors.registrationStartDate && (
                <p className="error" style={{ color: "red" }}>
                  {errors.registrationStartDate}
                </p>
              )}
            </label>
            <label>
            <p style={{display: "inline"}}>Registration End Date: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <DatePicker
                className="box"
                selected={registrationEndDate}
                onChange={(date) => setRegistrationEndDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                required
              />
              {errors.registrationEndDate && (
                <p className="error" style={{ color: "red" }}>
                  {errors.registrationEndDate}
                </p>
              )}
            </label>
          </div>
          <div className="event-dates">
            <label>
            <p style={{display: "inline"}}>Event Start Date: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <DatePicker
                className="box"
                selected={eventStartDate}
                onChange={(date) => setEventStartDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                required
              />
              {errors.eventStartDate && (
                <p className="error" style={{ color: "red" }}>
                  {errors.eventStartDate}
                </p>
              )}
            </label>
            <label>
            <p style={{display: "inline"}}>Event End Date: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <DatePicker
                className="box"
                selected={eventEndDate}
                onChange={(date) => setEventEndDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                required
              />
              {errors.eventEndDate && (
                <p className="error" style={{ color: "red" }}>
                  {errors.eventEndDate}
                </p>
              )}
            </label>
          </div>
        
          <label>
          <p style={{display: "inline"}}>Team Size: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
          <input
                            type="number"
                            min="1"
                            max="10"
                            value={teamSize}
                            onChange={(e) => setTeamSize(e.target.value)}
                            required
                        />
                        {errors.teamSize && <p className="error" style={{ color: "red", fontSize:"13px"}}>{errors.teamSize}</p>}
          </label>
          <label>
          <p style={{display: "inline"}}>Event Notice: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={(e) => setEventNotice(e.target.files[0])}
              required
            />
          </label>
          <label>
          <p style={{display: "inline"}}>Event Image: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
              required
            />
            {imageError && (
              <p className="error" style={{ color: "red" ,fontSize:"13px"}}>
                {imageError}
              </p>
            )}
          </label>
          <label>
          <p style={{display: "inline"}}>Event Website Link: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <input
              className="box"
             type="url"
              placeholder="Enter Event Link"
              value={eventLink}
              onChange={(e) => setEventLink(e.target.value)}
              required
            />
            {errors.eventLink && (
              <p className="error" style={{ color: "red" ,fontSize:"13px"}}>
                {errors.eventLink}
              </p>
            )}
          </label>
          <div className="radio-group">
          <p style={{display: "inline"}}>Select Event Mode: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            <label>
           <br></br>
              <input
                type="radio"
                value="online"
                checked={eventMode === "online"}
                onChange={() => setEventMode("online")}
              />
              <span></span>
              Online
            </label>
            <label>
              <input
                type="radio"
                value="offline"
                checked={eventMode === "offline"}
                onChange={() => setEventMode("offline")}
              />
              <span></span>
              Offline
            </label>
            {errors.eventMode && (
              <p className="error" style={{ color: "red",fontSize:"13px" }}>
                {errors.eventMode}
              </p>
            )}
          </div>
          <div className="checkbox-group">
          <p style={{display: "inline"}}>Select Departments: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
            {departments.map((department, index) => (
              <label key={index}>
                <input
                  className="checkbox1"
                  type="checkbox"
                  checked={selectedDepartments.includes(department)}
                  onChange={() => handleCheckboxChangedept(department)}
                />{" "}
                <span></span>
                {department}
              </label>
            ))}
            {errors.selectedDepartments && (
              <p className="error"  style={{ color: "red",fontSize:"13px" }}>
                {errors.selectedDepartments}
              </p>
            )}
          </div>

          <label>
            <div className="eligible-year-group">
            <p style={{display: "inline"}}>Eligible Years: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              {years.map((year) => (
                <label key={year}>
                  <input
                    className="checkbox1"
                    type="checkbox"
                    value={year}
                    checked={eligibleYears.includes(year)}
                    onChange={(e) => {
                      const updatedYears = e.target.checked
                        ? [...eligibleYears, year]
                        : eligibleYears.filter((y) => y !== year);
                      setEligibleYears(updatedYears);
                    }}
                  />
                  <span></span>
                  {year}
                </label>
              ))}
            </div>
          </label>

          {eligibleYears.map((year) => (
            <div key={year} className="criteria">
              <label>
                <p>Test Title for Year {year}:</p>
                <select
                  value={selectedTestTitles[year] || ""}
                  onChange={(e) =>
                    setSelectedTestTitles((prev) => ({
                      ...prev,
                      [year]: e.target.value,
                    }))
                  }
                  className={selectedTestTitles[year] ? "default-option" : ""}
                >
                  <option value="" disabled hidden>
                    Select Test Title
                  </option>
                  {testTitles[year] &&
                    testTitles[year].map((testTitle) => (
                      <option key={testTitle} value={testTitle}>
                        {testTitle}
                      </option>
                    ))}
                </select>
              </label>

              {selectedTestTitles[year] && (
                <div className="levels">
                  <label>
                    <p>Level for {selectedTestTitles[year]}:</p>
                    <select
                      value={selectedLevels[year] || ""}
                      onChange={(e) =>
                        setSelectedLevels((prev) => ({
                          ...prev,
                          [year]: e.target.value,
                        }))
                      }
                      className={selectedLevels[year] ? "default-option" : ""}
                    >
                      <option value="" disabled hidden>
                        Select Level
                      </option>
                      {levels[year] &&
                        levels[year][selectedTestTitles[year]] &&
                        levels[year][selectedTestTitles[year]].map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          ))}

          <label>
            <p>Event Level Count:</p>
            <input
              className="box"
              type="number"
              min="1"
              max="4"
              value={levelCount}
              onChange={handleLevelCountChange}
              required
            />
          </label>

          {Array.from({ length: levelCount }).map((_, index) => (
            <div key={index} className="level-details">
              <label>
                <p>Description for Level {index + 1}:</p>
                <textarea
                  className="para"
                  type="text"
                  placeholder={`Enter description for Level ${index + 1}`}
                  value={descriptions[index] || ""}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  required
                />
              </label>
              <label>
                <p>Total Reward Points for Level {index + 1}:</p>
                <input
                  className="box"
                  type="text"
                  placeholder={`Enter reward for Level ${index + 1}`}
                  value={rewards[index] || ""}
                  onChange={(e) => handleRewardChange(index, e.target.value)}
                  required
                />
              </label>
            </div>
          ))}

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default EventUploadForm;
