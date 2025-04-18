import { MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";

const SingleLoanCard = function (props){

    const {amount, title, startDate, emiAmount, status, tenureMonths, _id, interestRate} = props.loan
    console.log(amount)

    const navigate = useNavigate()

    const formattedStartDate = new Date(startDate).toLocaleDateString();


    return (
        <div className="border-2 p-2 rounded-md flex justify-between items-center">
            <div className="flex flex-col gap-2">
                <div className="text-lg font-bold">{title}</div>
                <div>Loan Amount - {amount}</div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="">Rate - {interestRate} %</div>
                <div>Tenure Months - {tenureMonths}</div>
            </div>


            <div className="flex flex-col gap-2">
                <div className="">Status - {status}</div>
                <div>Start Date - {formattedStartDate}</div>
            </div>


            <Link to={`/loan/${_id}/details`} >
                <div className="rounded-full bg-green-600 p-4 cursor-pointer">
                    <MdKeyboardArrowRight />
                </div>
            </Link>

            {/* <div className="rounded-full  p-4 cursor-pointer">
                <MdDelete />
            </div> */}

        </div>
    )
}


export default SingleLoanCard
