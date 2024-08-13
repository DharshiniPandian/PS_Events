// App.js
import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Events from './Admin/Events';
import Horinav from './Components/Horinav';
import Sidenav from './Components/Sidenav';
import EventUploadForm from './Admin/EventUploadForm';
import EventDetails1 from './Admin/EventDetails';
import EventUpdateForm from './Admin/EventUpdateForm';
import EventDetails2 from './Students/EventDetails';
import EventRegister from './Students/EventRegister';
import TeamMemberDetails from './Students/TeamMemberDetails';
import VerifyData from './Students/VerifyData';
import TeamDetails from './Admin/TeamDetails';
import RegistrationData from './Admin/EventRegistrationData';
import RegisteredEvents from './Students/RegisteredEvents';
import RegistrationStatus from './Students/RegistrationStatus';
import ReportSubmissionForm from './Students/ReportSubmissionForm';
import EventStatus from './Admin/EventStatus';
import ResubmitProject from './Students/ResubmitProject';
import { UserProvider, UserContext } from './UserContext';
import './App.css';

function App() {
    const [formData, setFormData] = useState({
        initialData: {},
        teamMembers: [],
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1370);
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get('http://localhost:8081/')
            .then(res => {
                if (res.data.valid) {
                    setUser({ email: res.data.email, role: res.data.role });
                } else {
                    navigate('/login');
                }
            })
            .catch(err => console.log(err));
    }, [navigate, setUser]);

    const handleLogout = () => {
        axios.get('http://localhost:8081/logout')
            .then(res => {
                if (res.data.message) {
                    setUser(null);
                    navigate('/login');
                }
            })
            .catch(err => console.log(err));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    useEffect(() => {
        function handleResize() {
            const newSize = window.innerWidth;
            setIsSidebarOpen(newSize >= 1370);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const shouldApplyLayout = location.pathname !== '/login';

    return (
        <div className="App">
            {(user && (user.role === 'admin' || user.role === 'student')) && (
                <>
                    <Horinav toggleSidebar={toggleSidebar} />
                    <Sidenav isOpen={isSidebarOpen} role={user.role} handleLogout={handleLogout} />
                </>
            )}
            <div className={shouldApplyLayout ? (window.innerWidth >= 1370 ? "content" : "content-collapsed") : ""}>
                <Routes>
                    <Route path='/' element={<Home role={user?.role} />} />
                    <Route path='/login' element={<Login />} />

                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path='/events' element={<Events />} />
                        <Route path="/upload" element={<EventUploadForm />} />
                        <Route path="/details/:id" element={<EventDetails1 />} />
                        <Route path="/update/:id" element={<EventUpdateForm />} />
                        <Route path="/:eventid/team-details/:eventId/:teamName" element={<TeamDetails />} />
                        <Route path="/eventstatus/:id" element={<EventStatus />} />
                        <Route path="/registration-data" element={<RegistrationData />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route path="/events/:id" element={<EventDetails2 />} />
                        <Route path="/eventregister/:eventName" element={<EventRegister formData={formData} setFormData={setFormData} />} />
                        <Route path="/team-members/:memberIndex" element={<TeamMemberDetails formData={formData} setFormData={setFormData} />} />
                        <Route path="/verify" element={<VerifyData formData={formData} />} />
                        <Route path="/registration-status/:eventName" element={<RegistrationStatus />} />
                        <Route path="/registeredevents" element={<RegisteredEvents />} />
                        <Route path="/reportSubmissionForm/:eventName" element={<ReportSubmissionForm />} />
                        <Route path="/reSubmitRegisteration/:eventName" element={<ResubmitProject />} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
