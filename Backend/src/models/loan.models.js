import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
    {    
        title: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        interestRate : {
            type: Number,
            required: true,
        },
        tenureMonths: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            // required: true, --> need to check this
        },
        owner : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        payments : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref : "Payment"
            }
        ],
        emiAmount: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["active", "foreclosed", "completed"],
            default: "active"
        },
    },
    {
        timestamps: true
    }
)

export const Loan = mongoose.model("Loan", loanSchema);