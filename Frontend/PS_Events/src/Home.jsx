import React from "react";
import Admin from "./Admin";
import './Home.css';
import Students from "./Students/Students";
import { useNavigate } from "react-router-dom";

function Home({role}) {  
    const navigate = useNavigate(); 
    return (
        <>
            <div>
            {role === "student" && <Students />}
                {role === "admin" && <Admin />}
                
               
            </div>
        </>
    );
}

export default Home;
