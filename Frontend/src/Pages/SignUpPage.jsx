import SignupForm from "../Components/User/SignupForm"

const SignUpPage = function() {
    return(
        <div className="min-h-full w-[100%] flex items-center justify-center bg-gray-50 py-7">
            <div className="w-[35%] bg-white p-12 rounded-lg shadow-lg ">
                <div className="text-center text-3xl font-bold text-gray-800">Create New Account</div>
                <SignupForm />
            </div>
        </div>
    )
}

export default SignUpPage