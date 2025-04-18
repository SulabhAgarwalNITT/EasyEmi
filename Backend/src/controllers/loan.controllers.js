import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { Loan } from "../models/loan.models.js";
import { isValidObjectId } from "mongoose";
import { Payment } from "../models/payment.models.js";

const createLoan = asyncHandler( async (req, res) => {
  const { title, amount, interestRate, tenureMonths, startDate } = req.body;
  const user = req.user._id;

  if (!title || typeof(amount) !== 'number' || typeof(interestRate) !== 'number' || typeof(tenureMonths) !== 'number') {
      throw new ApiError(400, "Fill the details properly");
  }

  if(!user){
      throw new ApiError(500, "User not found");
  }

  // calculating the emiAmount correctly using the formula
  const monthlyInterest = (interestRate / 12 / 100);
  const emiAmount = Math.floor((amount * monthlyInterest * ((Math.pow((1 + monthlyInterest), tenureMonths))) / (Math.pow((1 + monthlyInterest), tenureMonths) - 1)) * 100) / 100;

  // creating the loan entry
  const loan = await Loan.create({
      title,
      amount,
      interestRate,
      tenureMonths,
      owner: user,
      startDate,
      emiAmount,
      status: "active"
  });

  if(!loan){
      throw new ApiError(400, "Error in creating entry. Please try again later");
  }

  await createInitialPayment(loan._id); // Creating the initial payments with correct status

  return res.status(200).json(new ApiResponse(200, loan, "Loan Entry created Successfully"));
});

const createInitialPayment = async (loanId) => {
  try {
      if(!isValidObjectId(loanId)){
          throw new ApiError(400, "Loan id is not proper");
      }

      const loanDetails = await Loan.findById(loanId);
      if(!loanDetails){
          throw new ApiError(400, "Loan details not found");
      }

      const loanStartDate = loanDetails.startDate;
      const emiAmount = loanDetails.emiAmount;
      const tenure = loanDetails.tenureMonths;
      
      let payments = [];
      let i = 0;
      let dueDate = addiMonth(loanStartDate, 1); // Adding a month for the first EMI

      const dateNow = new Date();

      // Generating payments with status as "pending" or "late"
      while (i < tenure) {
        const status = dueDate <= dateNow ? "paid" : "upcoming";
        payments.push({
          loanId,
          status: status,
          dueDate,
          amount: emiAmount,
          emiNumber: i + 1,
          userId: loanDetails.owner
        });
      
        i++;
        dueDate = addiMonth(loanStartDate, i + 1);
      }

      await Payment.insertMany(payments); // Insert all payments
  } catch (error) {
      console.log("Error in creating initial Payment");
  }
};

// Helper function to add months correctly
function addiMonth(date, i) {
  const newDate = new Date(date);
  const day = newDate.getDate();

  newDate.setMonth(newDate.getMonth() + i);

  if (newDate.getDate() < day) {
      newDate.setDate(0); // last day of previous month
  }

  return newDate;
}

const gettotalLoanValue = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const loanSummary = await Loan.aggregate([
    {
      // Step 1: Match loans for the current user
      $match: { owner: userId }
    },
    {
      // Step 2: Calculate totalPayable and totalInterest for each loan
      $project: {
        amount: 1,
        emiAmount: 1,
        tenureMonths: 1,
        totalPayable: { $multiply: ["$emiAmount", "$tenureMonths"] },
        totalInterest: {
          $subtract: [
            { $multiply: ["$emiAmount", "$tenureMonths"] },
            "$amount"
          ]
        }
      }
    },
    {
      // Step 3: Lookup payments for each loan
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "loanId",
        as: "payments"
      }
    },
    {
      // Step 4: Calculate totalPaid by summing amounts of "paid" payments
      $project: {
        amount: 1,
        totalPayable: 1,
        totalInterest: 1,
        totalPaid: {
          $sum: {
            $map: {
              input: "$payments",
              as: "payment",
              in: {
                $cond: [
                  { $eq: ["$$payment.status", "paid"] },
                  "$$payment.amount",
                  0
                ]
              }
            }
          }
        }
      }
    },
    {
      // Step 5: Group to compute final totals
      $group: {
        _id: null,
        totalPrincipal: { $sum: "$amount" },
        totalPayable: { $sum: "$totalPayable" },
        totalInterest: { $sum: "$totalInterest" },
        totalPaid: { $sum: "$totalPaid" }
      }
    },
    {
      // Step 6: Calculate remaining amount
      $project: {
        totalPrincipal: 1,
        totalPayable: 1,
        totalInterest: 1,
        totalPaid: 1,
        remainingAmount: { $subtract: ["$totalPayable", "$totalPaid"] }
      }
    }
  ]);

  const result = loanSummary[0] || {
    totalPrincipal: 0,
    totalInterest: 0,
    totalPayable: 0,
    totalPaid: 0,
    remainingAmount: 0
  };

  return res.status(200).json(new ApiResponse(200, result, "Loan Summary fetched successfully"));
});

const getUserLoan = asyncHandler( async (req, res) => {
    const user = req.user?._id;
    if(!user) {
        throw new ApiError(400, "User not found")
    }

    const loandata = await Loan.aggregate(
        [
            {
                $match: {
                    owner: user
                }
            }
        ]
    )

    if(loandata.length < 1){
        throw new ApiError(400, "No loan found for user")
    }

    return res.status(200).json(new ApiResponse(200, loandata, "Loan fetched successfully"))
})

const deleteLoan = asyncHandler( async (req, res) => {
    const {loanId} = req.params
    if(!isValidObjectId(loanId)){
        throw new ApiError(400, "LoanId not valid")
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
        throw new ApiError(404, "Loan not found");
    }

    if (!loan.owner.equals(req.user._id)) {
        throw new ApiError(403, "User is not the owner of the loan");
    }

    await Loan.findByIdAndDelete(loanId)
    await Payment.deleteMany({loanId: loanId})

    return res.status(200).json(new ApiResponse(200, loan, "Loan deleted Successfully"))
})

const getLoanById = asyncHandler( async (req, res) =>  {
    const {loanId}  = req.params
    if(!isValidObjectId(loanId)){
        throw new ApiError(404, "Loan id not found")
    }

    const loan = await Loan.findById(loanId)

    if(!loan){
        throw new ApiError(403, "Unable to fetch loan, try again later")
    }

    return res.status(200).json(new ApiResponse(200, loan, "Loan fetched successfully"))
})

export {
    createLoan,
    gettotalLoanValue,
    getUserLoan,
    deleteLoan,
    getLoanById
}