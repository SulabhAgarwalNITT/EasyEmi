import { useState } from "react"
import axios from "axios"
import { apiConnecter } from "../../utils/apiconnector"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"

const SignupForm = function() {

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
    })

    const navigate = useNavigate()

    function changeHandler(event){
        setFormData( (prevData) => ({
            ...prevData,
            [event.target.name] : event.target.value
        }) )
    }

    // Form submission handler
    async function submitHandler(event){
        event.preventDefault() // Prevent default form submission

        try {
            // Send POST request to the backend for signup
            const response = await apiConnecter(
                "POST",
                "api/v1/users/register",
                formData
            )
            setFormData({name: "", age: "", email: "", password: ""}) // Reset form data
            console.log(response)
            toast.success(response.data.message)
            navigate("/")
        } catch (error) {
            console.log("Error during signup", error)
            if (error.response) {
                console.log(error.response)
                console.log(error.response.data.message);  // This might give you more specific details
            }
            toast.error(error.response?.data?.message || "Something went wrong in signup")
        }
    }

    return (
        <div className="w-[100%] rounded-lg  mt-8 text-xl">
            <form onSubmit={submitHandler} className="flex flex-col gap-5 w-[90%] ">
                <div className="flex flex-col gap-3">
                    <label htmlFor="name" className="text-md font-semibold">Enter Your Name</label>
                    <input 
                        type="text"
                        name="name"
                        onChange={changeHandler}
                        value={formData.name}
                        required
                        className="border-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="age" className="text-md font-semibold">Enter Your Age</label>
                    <input 
                        type="number"
                        name="age"
                        onChange={changeHandler}
                        value={formData.age}
                        required
                        className="border-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="email" className="text-md font-semibold">Enter Your Email</label>
                    <input 
                        type="email"
                        name="email"
                        onChange={changeHandler}
                        value={formData.email}
                        required
                        className="border-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="password" className="text-md font-semibold">Enter Password</label>
                    <input 
                        type="password"
                        name="password"
                        onChange={changeHandler}
                        value={formData.password}
                        required
                        className="border-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button type="submit" className="w-[80%] self-center my-5 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    Sign Up
                </button>
            </form>
        </div>
    )
}

export default SignupForm
