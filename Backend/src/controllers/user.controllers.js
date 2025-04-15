import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler( async (req, res) => {
    // step-1 Getting the from user
    const {name, email, age, password} = req.body;

    // Step-2 validating data 
    if(
        [name, email, password].some( (field) => !field || field?.trim()==="")
    ){
        throw new ApiError(400, "All field are required")
    }

    // step-3 checking if the user aldready exist
    const existedUser = await User.findOne({email})

    if(existedUser){
        throw new ApiError(409, "User with email already exist")
    }

    // Step-4 create a new user
    const user = await User.create({
        name,
        email,
        age,
        password
    })

    // removing the password and refershtoken for returning the value
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser,  "User created Successfully")
    )
})

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken ()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accesstoken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "error in generating refresh and access token")
    }
}

const loginUser = asyncHandler( async (req ,res) => {
    // step-1 first we get data from the 
    const {email, password} = req.body

    // step-2 validate the data
    if(!email || email?.trim() === ""){
        throw new ApiError(400, "Send Email Properly")
    }

    if(!password || password?.trim() === ""){
        throw new ApiError(400, "Password not send")
    }

    // step-3 check if user with email exist
    const existedUser = await User.findOne({email})

    // console.log(existedUser)
    if(!existedUser){
        throw new ApiError(404, "User Not Found. Please register first")
    }

    // step-4 check if user password is correct or not
    const isValidPassword = await existedUser.isPasswordCorrect(password)
    if(!isValidPassword){
        throw new ApiError(401, "Password is not correct")
    }

    // step-5 if everything is ok then give accesstoken and safe refresh token
    const {accesstoken, refreshToken} = await generateAccessTokenAndRefreshToken(existedUser._id);
    // step-6 removing the refresh token and password
    const loggedInUser = await User.findById(existedUser._id)

    // step-7 
    const option = {
        httpOnly : true,
        secure  : true
    }

    return res.status(200)
              .cookie("accessToken", accesstoken, option)
              .cookie("refreshToken", refreshToken, option)
              .json(new ApiResponse(200, {user: loggedInUser, accesstoken, refreshToken}, "User logged In successfully"))

})

const logoutUser = asyncHandler( async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            },
        },
        {
            new : true
        }
    )

    const option = {
        httpOnly: true,
        secure : true
    }

    return res.status(200)
                .clearCookie("accessToken", option)
                .clearCookie("refreshToken", option)
                .json(new ApiResponse(200, {userId: user._id}, "user logged out successfully"))

})

const changePassword = asyncHandler( async (req, res ) => {
    const userId = req?.user?._id
    if(!userId){
        throw new ApiError(500, "user not logged in")
    }

    // get data from frontend
    const {oldPassword, newPassoword, confirmPassword} = req.body

    // validate the data
    if(
        [oldPassword, newPassoword, confirmPassword].some ( (field) => {!field || field.trim() === ""} )
    ){
        throw new ApiError(400, "Send password details properly");
    }

    // check password is correct or not
    if(newPassoword !== confirmPassword) {
        throw new ApiError(400, "New Password do not match")
    }

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(500, "User not found");
    }

    const isValidPassword = await user.isPasswordCorrect(oldPassword)
    if(!isValidPassword){
        throw new ApiError(400, "Old password is not correct. Please try again")
    }

    user.password = newPassoword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {user : user._id}, "Password changed successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword
}