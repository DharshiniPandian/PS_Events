import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowCircleLeft } from "react-icons/fa";
import './ResubmitProject.css';

const ResubmitProject = () => {
  const { user } = useContext(UserContext);
  const { eventName } = useParams(); 
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    projectObjective: '',
    existingMethodology: '',
    proposedMethodology: ''
  });
  const navigate = useNavigate();
  const [data,setData]=useState(null);
  console.log(eventName);
  console.log(user.email);

  useEffect(() => {
    if (user && user.email && eventName) {
      axios.get(`http://localhost:8081/student/registration-details/${user.email}/${eventName}`)
        .then(response => {
          console.log('Fetched project data:', response.data);
          setData(response.data)
          // Ensure response.data matches the shape of projectData
          setProjectData({
            projectTitle: response.data[0].projectTitle || '',
            projectObjective: response.data[0].projectObjective || '',
            existingMethodology: response.data[0].existingMethodology || '',
            proposedMethodology: response.data[0].proposedMethodology || ''
          });
        })
        .catch(error => {
          console.error('Error fetching project data:', error);
        });
    }
  }, [user, eventName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8081/student/new-registration-details/${user.email}/${eventName}`, projectData)
      .then(response => {
        console.log('Project data updated:', response.data);
        navigate(`/registeredevents/registration-details/${eventName}`); 
      })
      .catch(error => {
        console.error('Error updating project data:', error);
      });
  };

  return (
    <>
      <div className='title'>
        <Link to={`/registeredevents/registration-details/${eventName}`}>
          <FaArrowCircleLeft size={18} color="black" aria-label="Back to events" />
        </Link>
        <h2>Resubmit Project Details</h2>
      </div>
      <div className='resubmitProject'>
        <div className="project-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectTitle">
                <p>Project Title:</p>
              </label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={projectData.projectTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectObjective">
                <p>Project Objective:</p>
              </label>
              <textarea
                className='para'
                id="projectObjective"
                name="projectObjective"
                value={projectData.projectObjective}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="existingMethodology">
                <p>Existing Methodology:</p>
              </label>
              <textarea
                className='para'
                id="existingMethodology"
                name="existingMethodology"
                value={projectData.existingMethodology}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="proposedMethodology">
                <p>Methodology of Proposed Plan:</p>
              </label>
              <textarea
                className='para'
                id="proposedMethodology"
                name="proposedMethodology"
                value={projectData.proposedMethodology}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit">Resubmit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResubmitProject;
