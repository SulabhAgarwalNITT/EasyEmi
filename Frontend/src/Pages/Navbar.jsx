import logo from "../assets/Images/logo.jpg"
import { Link } from "react-router"
import { useState, useEffect } from "react";

const Navbar = function (){

     // State to manage logged-in status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user has a token or logged-in state in localStorage
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);  // User is logged in
        }
    }, [isLoggedIn]);

    return(
        <div className="w-full p-3 bg-blue-500 ">
            <div className="w-[80%] mx-auto  flex justify-between items-center">
                <Link to="/">
                    <img src={logo} width="200px" height="100px"/>
                </Link>

                {
                    !isLoggedIn  && <div className="flex gap-3 mr-3">
                                        <Link to="/signup">
                                            <button>
                                                Sign up 
                                            </button>
                                        </Link>
                                        <Link to="/login">
                                            <button>
                                                Login
                                            </button>
                                        </Link>
                                    </div>
                }
                {
                    isLoggedIn && 
                        <div className=" flex gap-4 text-lg">
                            <Link>
                                <div>Contact Us</div>
                            </Link>
                            <Link>
                                <div>About Us</div> 
                            </Link>
                        </div>
                }
            </div>
        </div>
    )
}

export default Navbar