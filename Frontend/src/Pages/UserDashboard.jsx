import { Link } from "react-router"
import Cards from "../Components/Loan/Cards"
import { apiConnecter } from "../utils/apiconnector"
import LoanCard from "../Components/Loan/LoanCard"

const UserDashBoard = function (){

    return (
        <div className="w-[100%]">
            <div className="w-[60%] mx-auto">

                {/* setion -1 Three card - total Amount upcoming emi missed*/}
                <div className="mt-10">
                    <Cards/>
                </div>

                <div className="w-full mt-10">

                    <div className="flex justify-between ">
                        <h2 className="text-xl font-bold items-center   ">Your Loans</h2>
                        <Link to={"/addLoan"}>
                            <button >Add Loan</button>
                        </Link>
                    </div>


                    <div>
                        <LoanCard/>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default UserDashBoard