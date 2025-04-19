import { useState } from "react"
import { apiConnecter } from "../../utils/apiconnector";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const LoginForm = function (){

    const [formData, setFormData] = useState({email: "", password: ""});

    function changeHandler(event){
        setFormData( (prev) =>( {
            ...prev,
            [event.target.name] : event.target.value
        }))
    }

    const navigate = useNavigate()

    async function submitHandler(event){
        event.preventDefault()
        console.log(1)
        try {
            const response = await apiConnecter(
                "POST",
                "/api/v1/users/login",
                formData
            )
            setFormData({email: "", password: ""})
            console.log(response)
            toast.success(response.data?.message || "loggedIn success")
            localStorage.setItem("token", response.data.data.accesstoken)
            localStorage.setItem("user", JSON.stringify(response.data?.data?.user))
            window.location.href = "/user/dashboard"
            navigate("/user/dashboard")
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

                <button type="submit" className="w-[80%] self-center mx-auto my-5 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    Login
                </button>
            </form>
        </div>
    )
}

export default  LoginForm