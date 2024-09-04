import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./EventUpdateForm.css";
import { FaArrowCircleLeft, FaPlusCircle, FaMinusCircle } from "react-icons/fa";

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

const EventUpdateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    name: "",
    description: "",
    eventStartDate: null,
    eventEndDate: null,
    registrationStartDate: null,
    registrationEndDate: null,
    departments: [],
    eligibleYears: "",
    teamSize: "",
    eventMode: "",
    eventLink: "",
    eventImage: "",
    eventNotice: "",
    criteria: {
      year1: { course: "", level: "" },
      year2: { course: "", level: "" },
      year3: { course: "", level: "" },
      year4: { course: "", level: "" },
    },
    levelCount: 0,
    levelDetails: {
      level1: { description: "", rewards: "" },
      level2: { description: "", rewards: "" },
      level3: { description: "", rewards: "" },
      level4: { description: "", rewards: "" },
    },
  });

  const [eventImage, setEventImage] = useState(null);
  const [eventNotice, setEventNotice] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testTitles, setTestTitles] = useState({});
  const [levels, setLevels] = useState({});
  const [validationErrors, setValidationErrors] = useState({
    eventStartDate: "",
    eventEndDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    const yearsArray = event.eligibleYears.split(",");
    yearsArray.forEach((year) => {
      if (year) {
        fetchTestTitles(year);
      }
    });
  }, [event.eligibleYears]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/events/update/${id}`
      );
      const eventData = response.data;

      // Fetch levels for each year and course
      const yearsArray = eventData.eligibleYears.split(",");
      const fetchLevelsPromises = yearsArray.map((year) => {
        if (year && eventData.criteria[`year${year}`].course) {
          return fetchLevels(year, eventData.criteria[`year${year}`].course);
        }
        return Promise.resolve();
      });

      await Promise.all(fetchLevelsPromises);

      setEvent((prevEvent) => ({
        ...prevEvent,
        ...eventData,
        eventStartDate: eventData.eventStartDate
          ? new Date(eventData.eventStartDate)
          : null,
        eventEndDate: eventData.eventEndDate
          ? new Date(eventData.eventEndDate)
          : null,
        registrationStartDate: eventData.registrationStartDate
          ? new Date(eventData.registrationStartDate)
          : null,
        registrationEndDate: eventData.registrationEndDate
          ? new Date(eventData.registrationEndDate)
          : null,
        criteria: eventData.criteria || {
          year1: { course: "", level: "" },
          year2: { course: "", level: "" },
          year3: { course: "", level: "" },
          year4: { course: "", level: "" },
        },
        levelDetails: {
          level1: {
            description: eventData.level1description,
            rewards: eventData.level1rewards,
          },
          level2: {
            description: eventData.level2description,
            rewards: eventData.level2rewards,
          },
          level3: {
            description: eventData.level3description,
            rewards: eventData.level3rewards,
          },
          level4: {
            description: eventData.level4description,
            rewards: eventData.level4rewards,
          },
        },
        levelCount: eventData.levelCount || 0,
        eventImage: eventData.eventImage || "",
        eventNotice: eventData.eventNotice || "",
      }));
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const validateDates = () => {
    const errors = {};

    if (event.eventStartDate && event.eventEndDate) {
      if (event.eventStartDate > event.eventEndDate) {
        errors.eventEndDate = "Event End Date must be after Event Start Date.";
      }
    }

    if (event.registrationStartDate && event.registrationEndDate) {
      if (event.registrationStartDate > event.registrationEndDate) {
        errors.registrationEndDate =
          "Registration End Date must be after Registration Start Date.";
      }
    }

    if (event.eventStartDate && event.registrationEndDate) {
      if (event.eventStartDate > event.registrationEndDate) {
        errors.registrationEndDate =
          "Registration End Date must be after Event Start Date.";
      }
    }

    if (event.registrationStartDate && event.eventEndDate) {
      if (event.registrationStartDate > event.eventEndDate) {
        errors.eventEndDate =
          "Event End Date must be after Registration Start Date.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      const numericYear = year.match(/\d+/)[0];
      const response = await axios.get(
        `http://localhost:8081/criteria/levels/${numericYear}/${testTitle}`
      );
      const levels = response.data;
      console.log(testTitle, levels);
      setLevels((prev) => ({
        ...prev,
        [year]: { ...prev[year], [testTitle]: levels },
      }));
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "eventImage") {
      setEventImage(files[0]);
    } else if (name === "eventNotice") {
      setEventNotice(files[0]);
    }
  };

  const handleDateChange = (name, date) => {
    setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: date ? date : prevEvent[name], // Store the date as is
    }));
};

  
  
  const handleCheckboxChange = (field, value) => {
    setEvent((prevEvent) => {
      const fieldArray = Array.isArray(prevEvent[field])
        ? prevEvent[field]
        : [];
      return {
        ...prevEvent,
        [field]: fieldArray.includes(value)
          ? fieldArray.filter((item) => item !== value)
          : [...fieldArray, value],
      };
    });
  };

  const handleCheckboxChange1 = (field, value) => {
    setEvent((prevEvent) => {
      const currentArray = prevEvent[field]
        ? typeof prevEvent[field] === "string"
          ? prevEvent[field].split(",")
          : prevEvent[field]
        : [];
      const newValue = value.toString();
      const newArray = currentArray.includes(newValue)
        ? currentArray.filter((item) => item !== newValue)
        : [...currentArray, newValue];

      const updatedEvent = {
        ...prevEvent,
        [field]: newArray.join(","),
      };

      // Clear criteria for deselected years
      const deselectedYears = currentArray.filter(
        (item) => !newArray.includes(item)
      );
      const updatedCriteria = { ...updatedEvent.criteria };
      deselectedYears.forEach((year) => {
        updatedCriteria[`year${year}`] = { course: "", level: "" };
      });

      return { ...updatedEvent, criteria: updatedCriteria };
    });
  };

  const handleCriteriaChange = async (year, field, value) => {
    setEvent((prevEvent) => {
      const updatedCriteria = {
        ...prevEvent.criteria,
        [`year${year}`]: {
          ...prevEvent.criteria[`year${year}`],
          [field]: value,
        },
      };
      return { ...prevEvent, criteria: updatedCriteria };
    });

    // Fetch levels only if the field changed is 'course'
    if (field === "course" && value) {
      await fetchLevels(year, value);
    }
  };

  const handleLevelDetailsChange = (level, field, value) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      levelDetails: {
        ...prevEvent.levelDetails,
        [level]: {
          ...prevEvent.levelDetails[level],
          [field]: value,
        },
      },
    }));
  };

  const addLevel = () => {
    setEvent((prevEvent) => {
      const newLevelCount = prevEvent.levelCount + 1;
      const newLevelKey = `level${newLevelCount}`;
      return {
        ...prevEvent,
        levelCount: newLevelCount,
        levelDetails: {
          ...prevEvent.levelDetails,
          [newLevelKey]: { description: "", rewards: "" },
        },
      };
    });
  };

  const removeLevel = () => {
    setEvent((prevEvent) => {
      const newLevelCount = prevEvent.levelCount - 1;
      const newLevelDetails = { ...prevEvent.levelDetails };
      delete newLevelDetails[`level${prevEvent.levelCount}`];
      return {
        ...prevEvent,
        levelCount: newLevelCount,
        levelDetails: newLevelDetails,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateDates()) {
        setLoading(false);
        return;
    }

    // Ensure eligibleYears is an array
    const eligibleYears = Array.isArray(event.eligibleYears)
        ? event.eligibleYears
        : typeof event.eligibleYears === "string"
        ? event.eligibleYears
              .split(",")
              .map((year) => year.trim())
              .filter((year) => year)
        : [];

    // Convert eligibleYears to a comma-separated string
    const formattedEvent = {
        ...event,
        eventStartDate: event.eventStartDate
            ? event.eventStartDate.toLocaleDateString('en-CA') // Format date as 'YYYY-MM-DD'
            : null,
        eventEndDate: event.eventEndDate
            ? event.eventEndDate.toLocaleDateString('en-CA')
            : null,
        registrationStartDate: event.registrationStartDate
            ? event.registrationStartDate.toLocaleDateString('en-CA')
            : null,
        registrationEndDate: event.registrationEndDate
            ? event.registrationEndDate.toLocaleDateString('en-CA')
            : null,
        eligibleYears: eligibleYears.join(",").toString(),
    };

    // Prepare form data
    const formData = new FormData();
    formData.append("eventData", JSON.stringify(formattedEvent));
    if (eventImage) formData.append("eventImage", eventImage);
    if (eventNotice) formData.append("eventNotice", eventNotice);

    // Submit the form data
    try {
        const response = await axios.put(
            `http://localhost:8081/events/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.status === 200) {
            navigate(`/events/details/${id}`); // Redirect after successful submission
        }
    } catch (error) {
        console.error("Error updating event:", error);
        setError("Failed to update event.");
    } finally {
        setLoading(false);
    }
};


  const imageUrl = event.eventImage
    ? `http://localhost:8081/${event.eventImage.replace(/\\/g, "/")}`
    : null;
  const noticeUrl = event.eventNotice
    ? `http://localhost:8081/${event.eventNotice.replace(/\\/g, "/")}`
    : null;

  return (
    <>
      <div className="title">
        <Link to={`/events/details/${id}`}>
          <FaArrowCircleLeft size={28} color="black" />
        </Link>
        <h1>Update Event</h1>
      </div>
      <div className="eventUpdateForm">
        <div>
          <form onSubmit={handleSubmit} className="event-update-form">
            <label htmlFor="name">
              <p>
                Event Name{" "}
                <p
                  style={{ color: "red", fontSize: "15px", display: "inline" }}
                >
                  *
                </p>
              </p>
              <input
                type="text"
                id="name"
                name="name"
                value={event.name}
                onChange={handleChange}
                required
              />
            </label>

            <label htmlFor="description">
              <p>
                Description{" "}
                <p
                  style={{ color: "red", fontSize: "15px", display: "inline" }}
                >
                  *
                </p>
              </p>
              <textarea
                id="description"
                className="para"
                name="description"
                value={event.description}
                onChange={handleChange}
                required
              />
            </label>

            <div className="event-dates">
              <label>
                <p>
                  Event Start Date{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>
                <DatePicker
                  className="box"
                  selected={event.eventStartDate}
                  onChange={(date) => handleDateChange("eventStartDate", date)}
                  dateFormat="yyyy-MM-dd"
                  required
                />
                {validationErrors.eventStartDate && (
                  <p style={{ color: "red" }} className="error-message">
                    {validationErrors.eventStartDate}
                  </p>
                )}
              </label>

              <label>
                <p>
                  Event End Date{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>
                <DatePicker
                  className="box"
                  selected={event.eventEndDate}
                  onChange={(date) => handleDateChange("eventEndDate", date)}
                  dateFormat="yyyy-MM-dd"
                  required
                />
                {validationErrors.eventEndDate && (
                  <p style={{ color: "red" }} className="error-message">
                    {validationErrors.eventEndDate}
                  </p>
                )}
              </label>
            </div>

            <div className="register-dates">
              <label>
                <p>
                  Registration Start Date
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>
                <DatePicker
                  className="box"
                  selected={event.registrationStartDate}
                  onChange={(date) =>
                    handleDateChange("registrationStartDate", date)
                  }
                  dateFormat="yyyy-MM-dd"
                  required
                />
                {validationErrors.registrationStartDate && (
                  <p style={{ color: "red" }} className="error-message">
                    {validationErrors.registrationStartDate}
                  </p>
                )}
              </label>

              <label>
                <p>
                  Registration End Date{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>
                <DatePicker
                  className="box"
                  selected={event.registrationEndDate}
                  onChange={(date) =>
                    handleDateChange("registrationEndDate", date)
                  }
                  dateFormat="yyyy-MM-dd"
                  required
                />
                {validationErrors.registrationEndDate && (
                  <p style={{ color: "red" }} className="error-message">
                    {validationErrors.registrationEndDate}
                  </p>
                )}
              </label>
            </div>

            <label htmlFor="teamSize">
              <p>
                Team Size{" "}
                <p
                  style={{ color: "red", fontSize: "15px", display: "inline" }}
                >
                  *
                </p>
              </p>
              <input
                type="number"
                id="teamSize"
                name="teamSize"
                value={event.teamSize}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <p>Event Notice: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <input
                type="file"
                name="eventNotice"
                accept=".pdf"
                onChange={handleFileChange}
              />
              {event.eventNotice && (
                <a href={noticeUrl} target="_blank" rel="noopener noreferrer">
                  {event.eventImage ? "View Notice" : "No Notice Available"}
                </a>
              )}
              </label>

              <label htmlFor="eventLink"><p>Event Website Link <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <input
                 type="url" 
                 id="eventLink" 
                name="eventLink"
                value={event.eventLink}
                onChange={handleChange}
                required 
              />
              </label>

              <label>
          <p>Event Image: <p style={{color:"red" ,fontSize:"15px",display: "inline"}}>*</p></p>
              <input
                type="file"
                name="eventImage"
                accept="image/*"
                onChange={handleFileChange}
              />
              {event.eventImage && (
                  <img 
                  className="geo-tag-image"
                  src={`http://localhost:8081/${event.eventImage}`}
                  alt="Event"
                />
              )}
              </label>


         
              <div className="radio-group">
              <label>
                <p>
                  Select Event Mode:{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>
              </label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="eventMode"
                    value="online"
                    checked={event.eventMode === "online"}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  Online
                </label>
                <label>
                  <input
                    type="radio"
                    name="eventMode"
                    value="offline"
                    checked={event.eventMode === "offline"}
                    onChange={handleChange}
                    required
                  />
                  <span></span>
                  Offline
                </label>
              </div>
            </div>
          
            <div className="checkbox-group">
              <label>
                <p>
                  Select Departments{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>

                {departments.map((dept) => (
                  <label key={dept}>
                    <input
                      className="checkbox1"
                      type="checkbox"
                      name="departments"
                      value={dept}
                      checked={event.departments.includes(dept)}
                      onChange={() => handleCheckboxChange("departments", dept)}
                    />
                    <span></span>
                    {dept}
                  </label>
                ))}
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <p>
                  Eligible Years{" "}
                  <p
                    style={{
                      color: "red",
                      fontSize: "15px",
                      display: "inline",
                    }}
                  >
                    *
                  </p>
                </p>

                {years.map((year) => (
                  <label key={year}>
                    <input
                      type="checkbox"
                      className="checkbox1"
                      name="eligibleYears"
                      value={year}
                      checked={event.eligibleYears.split(",").includes(year)}
                      onChange={() =>
                        handleCheckboxChange1("eligibleYears", year)
                      }
                    />
                    <span></span>
                    {year}
                  </label>
                ))}
              </label>
            </div>
           
            <div className="criteria-section">
              <label>Criteria:</label>
              {years.map(
                (year) =>
                  event.eligibleYears.includes(year) && (
                    <div key={year} className="criteria-section">
                     <h3 style={{fontWeight:"500",fontSize:"20px",color:"black"}}>Criteria for Year {year}</h3>
                   
                        <label>Course:
                        <select
                          value={event.criteria[`year${year}`].course}
                          onChange={(e) =>
                            handleCriteriaChange(year, "course", e.target.value)
                          }
                        >
                          <option value="">Select Course</option>
                          {testTitles[year] &&
                            testTitles[year].map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                        </select>
                        </label>
                     
                      {event.criteria[`year${year}`].course && (
                        <div>
                          <label>Level:</label>
                          <select
                            value={event.criteria[`year${year}`].level}
                            onChange={(e) =>
                              handleCriteriaChange(
                                year,
                                "level",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Level</option>
                            {levels[year] &&
                              levels[year][
                                event.criteria[`year${year}`].course
                              ] &&
                              levels[year][
                                event.criteria[`year${year}`].course
                              ].map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>

       
            <label><h3 style={{fontWeight:"500",fontSize:"20px",color:"black"}}>Total Levels:</h3></label>
              <input
                type="number"
                name="levelCount"
                value={event.levelCount}
                onChange={handleChange}
                required
              />
         
            <div className="level-section">
            <p style={{fontWeight:"500",fontSize:"20px"}}>Event Level Overview</p>
              {[...Array(event.levelCount)].map((_, index) => {
                const level = `level${index + 1}`;
                return (
                  <div key={level}>
                     <div className="bor">
                    <h4  style={{fontWeight:"500",fontSize:"18px",color:"black"}}>{level.charAt(0).toUpperCase() + level.slice(1)}</h4>
                  
                    <label >Description </label>
                      <textarea 
                        value={event.levelDetails[level]?.description || ""}
                         className="para"
                        onChange={(e) =>
                          handleLevelDetailsChange(
                            level,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    
                    <div>
                    <label >Rewards</label>
                    <input 
                        value={event.levelDetails[level]?.rewards || ""}
                        onChange={(e) =>
                          handleLevelDetailsChange(
                            level,
                            "rewards",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  </div>
                );
              })}
              <div className="level-buttons">
                {event.levelCount < 4 && (
                  <button type="button" className="add" onClick={addLevel}>
                    <FaPlusCircle /> Add Level
                  </button>
                )}
                {event.levelCount > 0 && (
                  <button type="button"  className="remove" onClick={removeLevel}>
                    <FaMinusCircle /> Remove Level
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <button
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Event"}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>

        </div>
      </div>
    </>
  );
};

export default EventUpdateForm;
