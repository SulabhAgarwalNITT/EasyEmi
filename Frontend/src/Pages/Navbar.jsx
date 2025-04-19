import logo from "../assets/Images/logo.jpg"
import { Link } from "react-router"
import { useState, useEffect } from "react";
import { apiConnecter } from "../utils/apiconnector";
import { toast } from "react-toastify";

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

    async function clickHandler() {
        const confirm = window.confirm("Are you sure you want to logout?")
        if (!confirm) return;  // If user cancels, do nothing

        // Clear the token from localStorage and update the logged-in state
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/login";  // Redirect to login page

        try {
            const response = await apiConnecter("GET", "/api/v1/users/logout")
            toast.success(response.data.message || "Logged out successfully")
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

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
                    isLoggedIn && (
                        <div className="flex gap-4 mr-3">
                            <Link to={"/user/dashboard"} className="">
                                <button>
                                    DashBoard
                                </button>
                            </Link>

                            <button onClick={clickHandler}>
                                Logout
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Navbar