import React from 'react';
import './Sidenav.css';
import { NavLink } from 'react-router-dom';
import { MdOutlineDashboard, MdEventNote } from 'react-icons/md';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { MdLogout } from "react-icons/md";

function Sidenav({ isOpen, role, handleLogout }) {
    return (
        <div className={`sidenav ${isOpen ? "" : "hide"}`}>
            <div className='link'>
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                    <div className="box">
                        <MdOutlineDashboard className="icon" size={24} />
                        <p>Dashboard</p>
                    </div>
                </NavLink>
            </div>
            {role === 'admin' &&
                <div className="link">
                    <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
                        <div className="box">
                            <MdEventNote className="icon" size={24} />
                            <p>Events</p>
                        </div>
                    </NavLink>
                </div>
            }
            {role === 'student' &&
                <div className="link">
                    <NavLink to="/registeredevents" className={({ isActive }) => isActive ? "active" : ""}>
                        <div className="box">
                            <HiOutlineDocumentReport className="icon" size={24} />
                            <p>Registered Events</p>
                        </div>
                    </NavLink>
                </div>
            }
            <div className="link">
                <div className="box" onClick={handleLogout}>
                <MdLogout className="icon" size={24} />
                    <p>Logout</p>
                </div>
            </div>
        </div>
    );
}

export default Sidenav;
