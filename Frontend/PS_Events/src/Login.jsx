import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import img from './assets/Google.png';
import './Login.css';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get('http://localhost:8081/')
            .then(res => {
                if (res.data.valid) {
                    navigate('/');
                } else {
                    navigate('/login');
                }
            })
            .catch(err => console.log(err));
    }, [navigate]);

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:8081/login', values)
            .then(res => {
                if (res.data.Status === "Success") {
                    setUser({ email: values.email });
                    navigate('/');
                } else {
                    alert(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className="login">
            <div className="login-container">
                <div className="login-form">
                    <div className="login-header">
                        <h1>PS Events</h1>
                        <h2>Hi, Welcome back</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-container">
                            <input type="email" placeholder="Email" name='email'
                                onChange={e => setValues({ ...values, email: e.target.value })} />
                        </div>
                        <div className="input-container">
                            <input type="password" placeholder="Password" name='password'
                                onChange={e => setValues({ ...values, password: e.target.value })} />
                        </div>
                        <button type="submit" className="login-button">Login</button>
                        <button type="button" className="google-signin">
                            <img src={img} alt="Google Logo" />
                            Sign in with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
