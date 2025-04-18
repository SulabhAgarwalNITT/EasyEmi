import { useEffect, useState } from "react"
import { apiConnecter } from "../../utils/apiconnector"
import SingleLoanCard from "./SingleLoanCard"

const LoanCard = function (){

    const [loanData, setLoanData] = useState([])

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await apiConnecter(
                    "GET",
                    "/api/v1/loans/userLoan"
                )
                console.log(response.data)
                setLoanData(response.data.data)
            } catch (error) {
                console.error("Error fetching loans:", error)
            }
        }

        fetchLoans()
    }, [])

    return (
        <div className="flex flex-col gap-4 w-[95%] mx-auto mt-4">
            {
                loanData.length > 0 ? (
                    loanData.map((loan) => (
                        <SingleLoanCard key={loan._id} loan={loan}/>
                    ))
                ) : (
                    <div>No loans found</div>
                )
            }
        </div>
    )
}

export default  LoanCard