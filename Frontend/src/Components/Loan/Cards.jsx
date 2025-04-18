// import { useEffect, useState } from "react"
// import { apiConnecter } from "../../utils/apiconnector"

// const Cards = function (){

//     const [totalLoanDetails, setTotalLoanDetails] = useState(null)

//     useEffect( () => {
//         async function userLoanDetails() {
//             try {
//                 const response = await apiConnecter(
//                     'GET',
//                     "/api/v1/loans/totalLoan",
//                 )
//                 console.log(response)
//                 setTotalLoanDetails(response.data.data)
//             } catch (error) {
//                 console.log("Error while fetching loan details")
//             }
//         }
//         userLoanDetails()
//     }, [])

//     return (
//         <div className="w-full ">
//             {
//                 totalLoanDetails ? (
//                     <div className="w-full flex my-5 justify-between">
//                         <div className="w-[30%] rounded-lg bg-black text-xl text-white p-4 flex flex-col">
//                             <div>
//                                 Total Loan Amount
//                             </div>
//                             <div className="text-2xl">
//                                 Rs. {totalLoanDetails.totalPrincipal}
//                             </div>
//                         </div>

//                         <div className="w-[30%] rounded-lg bg-green-500 text-xl text-white p-4 flex flex-col">
//                             <div>
//                                 Remaining Amount
//                             </div>
//                             <div className="text-2xl">
//                                 Rs. {totalLoanDetails.remainingAmount}
//                             </div>
//                         </div>

//                         <div className="w-[30%] rounded-lg bg-blue-500 text-xl text-white p-4 flex flex-col">
//                             <div>
//                                 Total Paid
//                             </div>
//                             <div className="text-2xl">
//                                 Rs. {totalLoanDetails.totalPaid}
//                             </div>
//                         </div>
//                     </div>
//                 )
//                 :
//                 (
//                     <div>
                        
//                     </div>
//                 )
//             }
//         </div>
//     )
// }

// export default Cards


import { useEffect, useState } from "react";
import { apiConnecter } from "../../utils/apiconnector";

const Cards = function () {
    const [totalLoanDetails, setTotalLoanDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function userLoanDetails() {
            try {
                const response = await apiConnecter('GET', "/api/v1/loans/totalLoan");
                setTotalLoanDetails(response.data.data);
            } catch (error) {
                console.log("Error while fetching loan details");
            } finally {
                setLoading(false);
            }
        }
        userLoanDetails();
    }, []);

    const formatCurrency = (value) => {
        if (isNaN(value) || value === undefined || value === null) return "Rs. 0";
        return "Rs. " + value.toLocaleString();
    };

    return (
        <div className="w-full">
            {loading ? (
                <div className="text-center my-4 text-gray-500 text-lg">Loading loan summary...</div>
            ) : totalLoanDetails ? (
                <div className="w-full flex my-5 justify-between">
                    <div className="w-[30%] rounded-lg bg-black text-xl text-white p-4 flex flex-col">
                        <div>Total Loan Amount</div>
                        <div className="text-2xl">
                            {formatCurrency(totalLoanDetails.totalPrincipal)}
                        </div>
                    </div>

                    <div className="w-[30%] rounded-lg bg-green-500 text-xl text-white p-4 flex flex-col">
                        <div>Remaining Amount</div>
                        <div className="text-2xl">
                            {formatCurrency(totalLoanDetails.remainingAmount)}
                        </div>
                    </div>

                    <div className="w-[30%] rounded-lg bg-blue-500 text-xl text-white p-4 flex flex-col">
                        <div>Total Paid</div>
                        <div className="text-2xl">
                            {formatCurrency(totalLoanDetails.totalPaid)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center my-4 text-red-500 text-lg">
                    No loan data available.
                </div>
            )}
        </div>
    );
};

export default Cards;
