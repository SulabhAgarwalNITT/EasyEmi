import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Loan } from "../models/loan.models.js";
import { Payment } from "../models/payment.models.js";

// Helper: Safely adds i month while preserving end-of-month
function addiMonth(date, i) {
    const newDate = new Date(date);
    const day = newDate.getDate();

    newDate.setMonth(newDate.getMonth() + i);

    if (newDate.getDate() < day) {
        newDate.setDate(0); // last day of previous month
    }

    return newDate;
}

const createInitialPayment = asyncHandler ( async (req, res) => {
    const {loanId} = req.params

    if(!isValidObjectId(loanId)){
        throw new ApiError(400, "Loan id is not proper")
    }

    const loanDetails = await Loan.findById(loanId);
    if(!loanDetails){
        throw new ApiError(400, "Loan details not found")
    }

    const loanStartDate = loanDetails.startDate
    const emiAmount = loanDetails.emiAmount
    const tenure = loanDetails.tenureMonths

    let payments = [];
    let i = 0;
    let dueDate = addiMonth(loanStartDate, 1)

    const dateNow = new Date()

    while(dueDate < dateNow && i< tenure){
        payments.push(
            {
                loanId,
                status: "late",
                dueDate,
                amount : emiAmount,
                emiNumber : i+1,
                userId: loanDetails.owner
            }
        )

        i++;
        dueDate = addiMonth(loanStartDate , i + 1)
    }

    await Payment.insertMany(payments);

    return res.status(200).json(new ApiResponse(200, payments, "Initial Payment created successfully"))
})

export const autoGenerateMonthlyPayment = async () => {
    const today = new Date();
    const activeLoans = await Loan.find({ status: "active" });
    for (const loan of activeLoans) {
        const { startDate, tenureMonths, emiAmount, _id: loanId, owner } = loan;
        for (let i = 0; i < tenureMonths; i++) {
            let dueDate = addiMonth(startDate , i+1);

            if (dueDate > today) break;

            const startOfDay = new Date(dueDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dueDate);
            endOfDay.setHours(23, 59, 59, 999);

            const existing = await Payment.findOne({
                loanId,
                dueDate: { $gte: startOfDay, $lte: endOfDay }
            });

            if (existing) continue;
            await Payment.create({
                loanId,
                dueDate,
                amount: Math.round(emiAmount),
                status: "unpaid",
                emiNumber: i+1,
                userId: owner
            });

        }
    }
};

const deletePayment = asyncHandler( async (req, res) => {
    const {paymentId} = req.params;

    if(!isValidObjectId(paymentId)){
        throw new ApiError(400, "Invalid payment id")
    }

    const payment = await Payment.findById(paymentId);
    const loan = await Loan.findById(payment.loanId);

    if(!loan.owner.equals(req.user.id)){
        throw new ApiError(200, "User is not the owner")
    }

    const deletedPayment = await Payment.findByIdAndDelete(paymentId)
    return res.status(200).json(new ApiResponse (200, deletedPayment, "Payment deleted successfully"))
})  

const deleteAll = asyncHandler( async (req, res) => {
    await Payment.deleteMany({})
    return res.status(200).json(new ApiResponse (200, {}, "Payment deleted successfully"))
})  

const getAllPaymentForUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const paymentData = await Payment.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $group: {
                _id: "$loanId", // Group by loan
                totalPaid: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0]
                    }
                },
                totalDue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "late"] }, "$amount", 0]
                    }
                },
                totalUnpaid: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "unpaid"] }, "$amount", 0]
                    }
                },
                allPayments: { $push: "$$ROOT" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, paymentData, "User payments grouped by loan"));
});

const getAllPaymentForLoan = asyncHandler(async (req, res) => {
    const { loanId } = req.params;

    if (!isValidObjectId(loanId)) {
        throw new ApiError(400, "Invalid loan ID");
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
        throw new ApiError(404, "Loan not found");
    }

    const paymentData = await Payment.aggregate([
        {
            $match: {
                loanId: new mongoose.Types.ObjectId(loanId) // ensure it's in correct format
            }
        },
        {
            $group: {
                _id: "$loanId",
                totalPaid: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0]
                    }
                },
                totalDue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "late"] }, "$amount", 0]
                    }
                },
                totalUnpaid: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "unpaid"] }, "$amount", 0]
                    }
                },
                allPayments: {
                    $push: "$$ROOT"
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, paymentData[0] || {}, "All loan payments"));
});

const markPaymentAsPaid = asyncHandler( async (req, res) => {
    console.log(1)
    const {paymentId} = req.params
    if(!isValidObjectId(paymentId)){
        throw new ApiError(400, "Paymentid not found")
    }

    const payment = await Payment.findById(paymentId);

    if(!payment){
        throw new ApiError(400, "Payment not found")
    }

    if(!payment.userId.equals(req.user._id)){
        throw new ApiError(400, "User is not authorized to update this payment")
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
            $set: {
                status: "paid",
                paidDate: new Date()
            }
        },
        {new : true}
    )

    return res.status(200).json(new ApiResponse(200, updatedPayment, "Marked as Paid"))
})

export {
    createInitialPayment,
    deletePayment,
    getAllPaymentForUser,
    getAllPaymentForLoan,
    markPaymentAsPaid,
    deleteAll
}