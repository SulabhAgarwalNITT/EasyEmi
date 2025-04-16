import mongoose  from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        loanId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Loan",
            required: true
        },
        paidDate : {
            type : Date
        },
        status: {
            type: String,
            enum : ["paid", "unpaid", "late"],
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        emiNumber : {
            reqired : true,
            type: Number
        },
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Payment = mongoose.model("Payment", paymentSchema)