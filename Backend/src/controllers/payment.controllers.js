import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Loan } from "../models/loan.models.js";
import { Payment } from "../models/payment.models.js";
import { mailSender } from "../utils/mailSender.util.js";

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
    today.setHours(0, 0, 0, 0);
  
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);
  
    const paymentsToUpdate = await Payment.find({
      status: "upcoming",
      dueDate: {
        $gte: today,         // from today
        $lte: twoDaysLater   // to 2 days from now
      }
    });
  
    for (const payment of paymentsToUpdate) {
      payment.status = "unpaid";
      await payment.save();
    }
  };

export const sendEmailReminder = async () => {
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 3);
    reminderDate.setHours(0, 0, 0, 0);
    console.log(1)
    const endOfReminderDay = new Date(reminderDate);
    endOfReminderDay.setHours(23, 59, 59, 999);
    console.log(2)
  
    const upcomingPayments = await Payment.find({
      dueDate: { $gte: reminderDate, $lte: endOfReminderDay },
      status: "upcoming"
    }).populate("userId").populate("loanId");
    console.log(3)
  
    for (const payment of upcomingPayments) {
        console.log(payment)
      const email = payment.userId.email;
      const loanTitle = payment.loanId.title || "your loan";
      const dueDate = new Date(payment.dueDate).toLocaleDateString();
      const amount = payment.amount;
  
      const title = "⏰ EMI Payment Reminder - EasyEMI";
      const body = `
        <p>Hi ${payment.userId.name || ''},</p>
        <p>This is a friendly reminder that your EMI of <strong>₹${amount}</strong> for <strong>${loanTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p>Please make the payment on time to avoid any penalties.</p>
        <br/>
        <p>Thank you,<br/>EasyEMI Team</p>
      `;
        console.log("Sending email to: ")
      await mailSender(email, title, body);
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
    deleteAll,
}