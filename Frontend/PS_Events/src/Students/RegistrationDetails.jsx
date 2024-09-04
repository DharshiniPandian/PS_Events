import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowCircleLeft } from "react-icons/fa";
import './RegistrationDetails.css';

const RegistrationDetails = () => {
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

  useEffect(() => {
    if (user && user.email && eventName) {
      axios.get(`http://localhost:8081/student/registration-details/${user.email}/${eventName}`)
        .then(response => {
          setProjectData({
            projectTitle: response.data[0].projectTitle || '',
            projectObjective: response.data[0].projectObjective || '',
            existingMethodology: response.data[0].existingMethodology || '',
            proposedMethodology: response.data[0].proposedMethodology || ''
          });
          setData(response.data[0]);
          console.log(data?.isTeamLeader)
        })
        .catch(error => {
          console.error('Error fetching project data:', error);
        });
    }
  }, [user, eventName]);

  const handleEdit = () => {
    navigate(`/registeredevents/reSubmitRegisteration/${eventName}`);
  };

  return (
    <>
      <div className='title'>
        <Link to={`/registeredevents/registration-status/${eventName}`}>
          <FaArrowCircleLeft size={18} color="black" aria-label="Back to events" />
        </Link>
        <h2>Project Details</h2>
      </div>
      <div className='registrationDetails'>
        <div className="project-form">
          <div className="form-group">
            <label htmlFor="projectTitle">
              <p>Project Title:</p>
            </label>
            <input
              className='p1'
              type="text"
              id="projectTitle"
              name="projectTitle"
              value={projectData.projectTitle}
              readOnly
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
              readOnly
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
              readOnly
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
              readOnly
            ></textarea>
          </div>

         {data?.RegistrationApproval===0 && data?.isTeamLeader===1 && <button type="button" onClick={handleEdit}>Edit</button> }
        </div>
      </div>
    </>
  );
};

export default RegistrationDetails;
