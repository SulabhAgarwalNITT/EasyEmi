import LoginForm from "../Components/User/LoginForm"

const LoginPage = function (){
    return (
        <div className="w-full min-h-full flex items-center justify-center mt-20">
            <div className="w-[35%] bg-white p-12 rounded-lg shadow-lg  ">
                <div className="text-center text-3xl font-bold text-gray-800">Login</div>
                <LoginForm />
            </div>
        </div>
    )
}

export default  LoginPage