import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventUploadForm.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

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
  "Department 16",
  "Department 17",
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
  const [eligibleYears, setEligibleYears] = useState([]);
  const [testTitles, setTestTitles] = useState({});
  const [levels, setLevels] = useState({});
  const [selectedTestTitles, setSelectedTestTitles] = useState({});
  const [selectedLevels, setSelectedLevels] = useState({});
  const navigate = useNavigate();

  const handleCheckboxChange = (setFunction, value) => {
    setFunction((prevState) =>
      prevState.includes(value)
        ? prevState.filter((item) => item !== value)
        : [...prevState, value]
    );
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
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Event Start Date:", eventStartDate);
    console.log("Event End Date:", eventEndDate);
    
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
      registrationStartDate
        ? registrationStartDate.toISOString().split("T")[0]
        : ""
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
    eligibleYears.forEach((year) => {
      eventData.append(`criteria[${year}][testTitle]`, selectedTestTitles[year] || '');
      eventData.append(`criteria[${year}][level]`, selectedLevels[year][selectedTestTitles[year]] || '');
    });
  
    // Append files if selected
    if (eventNotice) {
      eventData.append("eventNotice", eventNotice, eventNotice.name);
    }
    if (eventImage) {
      eventData.append("eventImage", eventImage, eventImage.name);
    }
    const entries = Array.from(eventData.entries());
    const dataObject = Object.fromEntries(entries);
    console.log("Event Data:", dataObject);
  
    axios
      .post("http://localhost:8081/events/upload", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Event created successfully:", response.data);
        // Optionally reset the form
        setName("");
        setDescription("");
        setEventStartDate(null);
        setEventEndDate(null);
        setRegistrationStartDate(null);
        setRegistrationEndDate(null);
        setSelectedDepartments([]);
        setTeamSize("");
        setEventLink("");
        setEventNotice(null);
        setEventMode("");
        setEventImage(null);
        setEligibleYears([]);
        setTestTitles({});
        setLevels({});
        setSelectedTestTitles({});
        setSelectedLevels({});
        alert("Upload Successful");
        navigate("/events");
      })
      .catch((error) => {
        if (error.response) {
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
      <h1>Upload Event Details</h1>
      <div className="eventUploadForm">
        <form className="uploadform" onSubmit={handleSubmit}>
          <label>
            <p>Event Name:</p>
            <input
              className="box"
              type="text"
              placeholder="Enter Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <p>Event Description:</p>
            <textarea
              className="para"
              placeholder="Enter Event Description with Address."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="event-dates">
            <label>
              <p>Event Start Date:</p>
              <DatePicker
                className="box"
                selected={eventStartDate}
                onChange={(date) => setEventStartDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
              />
            </label>
            <label>
              <p>Event End Date:</p>
              <DatePicker
                className="box"
                selected={eventEndDate}
                onChange={(date) => setEventEndDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
              />
            </label>
          </div>
          <div className="register-dates">
            <label>
              <p>Registration Start Date:</p>
              <DatePicker
                className="box"
                selected={registrationStartDate}
                onChange={(date) => setRegistrationStartDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
              />
            </label>
            <label>
              <p>Registration End Date:</p>
              <DatePicker
                className="box"
                selected={registrationEndDate}
                onChange={(date) => setRegistrationEndDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
              />
            </label>
          </div>
          <label>
            <p>Team Size:</p>
            <select
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className={teamSize === "" ? "default-option" : ""}
            >
              <option value="" disabled>
                Select a team size
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </label>
          <label>
            <p>Event Link:</p>
            <input
              className="box"
              type="text"
              placeholder="Event Registration link"
              value={eventLink}
              onChange={(e) => setEventLink(e.target.value)}
            />
          </label>
          <label>
            <p>Eligible Departments:</p>
            {departments.map((department) => (
              <label key={department}>
                <input
                  type="checkbox"
                  value={department}
                  checked={selectedDepartments.includes(department)}
                  onChange={(e) => {
                    const updatedDepartments = e.target.checked
                      ? [...selectedDepartments, department]
                      : selectedDepartments.filter((dep) => dep !== department);
                    setSelectedDepartments(updatedDepartments);
                  }}
                />
                {department}
              </label>
            ))}
          </label>
          <label>
            <p>Eligible Years:</p>
            {years.map((year) => (
              <label key={year}>
                <input
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
                {year}
              </label>
            ))}
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
                  className={selectedTestTitles[year] === "" ? "default-option" : ""}
                >
                  <option value="" disabled>
                    Select Test Title
                  </option>
                  {(testTitles[year] || []).map((testTitle) => (
                    <option key={testTitle} value={testTitle}>
                      {testTitle}
                    </option>
                  ))}
                </select>
              </label>
              {selectedTestTitles[year] && (
                <label>
                  <p>Level for {selectedTestTitles[year]}:</p>
                  <select
                    value={
                      (selectedLevels[year] &&
                        selectedLevels[year][selectedTestTitles[year]]) ||
                      ""
                    }
                    onChange={(e) =>
                      setSelectedLevels((prev) => ({
                        ...prev,
                        [year]: {
                          ...prev[year],
                          [selectedTestTitles[year]]: e.target.value,
                        },
                      }))
                    }
                    className={
                      !(
                        selectedLevels[year] &&
                        selectedLevels[year][selectedTestTitles[year]]
                      )
                        ? "default-option"
                        : ""
                    }
                  >
                    <option value="" disabled>
                      Select Level
                    </option>
                    {(
                      (levels[year] && levels[year][selectedTestTitles[year]]) ||
                      []
                    ).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          ))}
           <label>
            <p>Event Mode:</p>
            <select
              value={eventMode}
              onChange={(e) => setEventMode(e.target.value)}
              className={eventMode === "" ? "default-option" : ""}
            >
              <option value="" disabled>
                Select Mode
              </option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <label>
            <p>Event Notice:</p>
            <input
              className="box"
              type="file"
              accept="application/pdf"
              onChange={(e) => setEventNotice(e.target.files[0])}
            />
          </label>
          <label>
            <p>Event Image:</p>
            <input
              className="box"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageChange}
            />
          </label>
          {imageError && <p className="error-message">{imageError}</p>}

          <button type="submit" className="submit-button">
            Upload Event
          </button>
        </form>
      </div>
    </>
  );
}

export default EventUploadForm;
