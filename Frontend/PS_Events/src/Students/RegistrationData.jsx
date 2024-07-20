import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RegistrationData.css';
import { LuEye } from "react-icons/lu";

const RegistrationData = () => {
    const name = "Event new";
    const eventid = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const location = useLocation();

    // Function to fetch data from the server
    const fetchData = async () => {
        try {
            console.log(name);
            const response = await axios.get(`http://localhost:8081/events/${name}/teams`); // Adjust the URL according to your API endpoint
            const teamsData = response.data;
            console.log(teamsData);

            // Fetch team leader names if not included
            const updatedData = await Promise.all(
                teamsData.map(async (team) => {
                    if (!team.teamLeader) {
                        const leaderResponse = await axios.get(`http://localhost:8081/student/teams/${team.eventId}/${team.teamName}`);
                        return {
                            ...team,
                            teamLeader: leaderResponse.data.teamLeader,
                            rollNo: leaderResponse.data.rollNo
                        };
                    }
                    return team;
                })
            );

            setData(updatedData);
            setFilteredData(updatedData);
            console.log(updatedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [name]);

    // Function to handle search input change
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        const filtered = data.filter(item =>
            item.teamName.toLowerCase().includes(value.toLowerCase()) ||
            item.rollNo.toLowerCase().includes(value.toLowerCase()) ||
            item.status.toLowerCase().includes(value.toLowerCase()) ||
            item.teamLeader.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <div className='registration-data'>
            <div className='registration-container'>
                <div className='top'>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className='table-container'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Team Name</th>
                                <th>Team Leader</th>
                                <th>Roll No</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.teamName}</td>
                                    <td>{item.teamLeader}</td>
                                    <td>{item.rollNo}</td>
                                    <td>{item.level1 === 0 ? "Waiting for Approval" : "Approved"}</td>
                                    <td>
                                        <Link to={`/${eventid}/team-details/${item.eventId}/${item.teamName}/`} className={location.pathname === `/team/${item.teamName}` ? "active" : ""}>
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

export default RegistrationData;
