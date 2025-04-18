import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiConnecter } from "../utils/apiconnector";

const LoanDetail = () => {
  const { loanId } = useParams();
  const [loanDetail, setLoanDetail] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);

  useEffect(() => {
    async function getDetail() {
      try {
        console.log(loanId)
        const response = await apiConnecter(
            "GET",
            `/api/v1/loans/${loanId}/loandata`
        );
        console.log(response)
        setLoanDetail(response.data.data);
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    }

    getDetail();
  }, [loanId]);

  useEffect(() => {
    async function getPaymentDetail() {
      try {
        const response = await apiConnecter(
          "GET",
          `/api/v1/payments/${loanId}/getLoanPaymentsDetails`
        );
        console.log(response)

        setPaymentDetails(response.data.data.allPayments);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    }

    getPaymentDetail();
  }, [loanId]);

  const markAsPaid = async (paymentId) => {
    try {
        console.log(paymentId)
        await apiConnecter(
            "PATCH", 
            `/api/v1/payments/${paymentId}/markPaid`
        );
      // Refresh the payments after updating
        const updated =  await apiConnecter(
            "GET",
            `/api/v1/payments/${loanId}/getLoanPaymentsDetails`
        );
        setPaymentDetails(updated.data.data.allPayments);
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Loan Details</h2>

      {loanDetail && (
        <div className="mb-6 p-4 border rounded shadow-sm bg-white flex gap-10">
            <div className="w-[45%] text-xl">
                <p><strong>Title:</strong> {loanDetail.title}</p>
                <p><strong>Amount:</strong> ₹{loanDetail.amount}</p>
                <p><strong>EMI:</strong> ₹{loanDetail.emiAmount}</p>
                <p><strong>Interest Rate:</strong> {loanDetail.interestRate}%</p>
            </div>
            <div className="w-[45%]  text-xl">
                <p><strong>Tenure:</strong> {loanDetail.tenureMonths} months</p>
                <p><strong>Start Date:</strong> {new Date(loanDetail.startDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {loanDetail.status}</p>
            </div>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Payment History</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S.No.</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Paid Date</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentDetails.length > 0 ? (
              paymentDetails.map((payment, index) => (
                <tr key={payment._id} className="text-center">
                  <td className="border p-2">{payment.emiNumber}</td>
                  <td className="border p-2">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="border p-2">₹{payment.amount}</td>
                  <td className={`border p-2 ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </td>
                  <td className="border px-4 py-2">
                        {payment.status === "late"  && (
                            <div
                                onClick={() => markAsPaid(payment._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-1 py-1 rounded cursor-pointer"
                            >
                                Mark as Paid
                            </div>
                        )}
                        {payment.status === "paid" &&  (
                            <span className="text-gray-400">✔</span>
                        )}
                        {payment.status === "upcoming" &&  (
                            <span className="text-gray-400">Not Available</span>
                        )}
                    </td>   
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border text-center" colSpan="5">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper to style status
function getStatusColor(status) {
  switch (status) {
    case "paid":
      return "text-green-600";
    case "unpaid":
      return "text-red-600";
    case "late":
      return "text-yellow-600";
    case "upcoming":
      return "text-blue-600";
    default:
      return "";
  }
}

export default LoanDetail;
