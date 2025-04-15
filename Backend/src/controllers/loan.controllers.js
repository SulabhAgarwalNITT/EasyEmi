import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { Loan } from "../models/loan.models.js";
import { isValidObjectId } from "mongoose";

const createLoan = asyncHandler( async (req, res) => {
    // get details from the user
    const {title, amount, interestRate, tenureMonths, startDate} = req.body
    const user = req.user._id

    // Validate the values
    if (!title || typeof(amount) !== 'number' || typeof (interestRate) !== 'number' || typeof(tenureMonths) !== 'number') {
        throw new ApiError(400, "Fill the details properly");
    }

    if(!user){
        throw new ApiError(500, "User not found")
    }

    // calculating the emiAmount
    const monthlyInterest = (interestRate/12/100);
    const emiAmount = Math.floor((amount*monthlyInterest*((Math.pow((1 + monthlyInterest) , tenureMonths)))/(Math.pow((1 + monthlyInterest) , tenureMonths) - 1))*100)/100;

    // creating the loan entry
    const loan = await Loan.create({
        title,
        amount,
        interestRate,
        tenureMonths,
        owner : user,
        startDate,
        emiAmount,
        status : "active"
    })

    // 
    if(!loan){
        throw new ApiError(400, "Error in creating entry. Please try again later")
    }

    return res.status(200).json(new ApiResponse(200, loan, "Loan Entry created Successfully"))
})

const gettotalLoanValue = asyncHandler( async (req, res) => {
    const userId = req.user._id

    const loanSummary = await Loan.aggregate([
        {
          // Step 1: Match the loans of the current user
          $match: {
            owner: userId
          }
        },

        {
          // Step 2: Calculate additional fields like totalPayable and totalInterest
          $project: {
            amount: 1,             // Principal amount
            emiAmount: 1,          // Monthly EMI amount
            tenureMonths: 1,       // Loan tenure in months
            totalPayable: { 
              $multiply: ["$emiAmount", "$tenureMonths"] 
            },                      // Total amount to be paid (EMI * tenure)
            totalInterest: {
              $subtract: [
                { $multiply: ["$emiAmount", "$tenureMonths"] },  // EMI * tenure
                "$amount"                                       // Principal amount
              ]
            }
          }
        },
        
        {
          // Step 3: Lookup to join with the Payment collection to calculate totalPaid
          $lookup: {
            from: "payments",           // Assuming payments collection is named "payments"
            localField: "_id",          // Join on loan's _id field
            foreignField: "loanId",     // Match loanId in the payment collection
            as: "payments",              // The resulting payments will be stored in "payments" array
            }
          
        },
        {
          // Step 4: Unwind the payments array to sum up all the payments
          $unwind: {
            path: "$payments",
            preserveNullAndEmptyArrays: true // Handle cases where no payments exist
          }
        },
        {
          // Step 5: Group the data to calculate totals
          $group: {
            _id: null,  // Group all records into a single document
            totalPrincipal: { $sum: "$amount" }, // Sum of all principal amounts
            totalInterest: { $sum: "$totalInterest" }, // Sum of total interest across all loans
            totalPayable: { $sum: "$totalPayable" }, // Sum of total payable across all loans
            totalPaid: { $sum: "$payments.amount" },  // Sum of all paid amounts (from payments collection)
          }
        },
        {
          // Step 6: Calculate remainingAmount
          $project: {
            totalPrincipal: 1,
            totalInterest: 1,
            totalPayable: 1,
            totalPaid: 1,
            remainingAmount: { 
              $subtract: ["$totalPayable", "$totalPaid"] // Total payable - Total paid
            }
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
})

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