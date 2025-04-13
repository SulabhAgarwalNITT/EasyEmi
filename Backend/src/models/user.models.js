import mongoose, {Mongoose} from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            required: true,
            type: String,
        },
        age:{
            type: Number,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password : {
            type: String,
            required: true,
            minlength : 6
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model("User", userSchema);