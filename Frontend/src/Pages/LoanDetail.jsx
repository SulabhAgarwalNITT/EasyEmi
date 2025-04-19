import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiConnecter } from "../utils/apiconnector";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";


const LoanDetail = () => {
  const { loanId } = useParams();
  const [loanDetail, setLoanDetail] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [totalPaid, settotalPaid] = useState(0)

  useEffect(() => {
    async function getDetail() {
      try {
        const response = await apiConnecter("GET", `/api/v1/loans/${loanId}/loandata`);
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
        const payments = response.data.data.allPayments;
        setPaymentDetails(payments);
        settotalPaid(response.data.data.totalPaid)
        const years = [...new Set(payments.map(p => new Date(p.dueDate).getFullYear()))]
          .sort((a, b) => b - a);
        setAvailableYears(years);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    }

    getPaymentDetail();
  }, [loanId]);

  const markAsPaid = async (paymentId) => {
    try {
      await apiConnecter("PATCH", `/api/v1/payments/${paymentId}/markPaid`);
      const updated = await apiConnecter(
        "GET",
        `/api/v1/payments/${loanId}/getLoanPaymentsDetails`
      );
      const updatedPayments = updated.data.data.allPayments;
      setPaymentDetails(updatedPayments);

      const years = [...new Set(updatedPayments.map(p => new Date(p.dueDate).getFullYear()))]
        .sort((a, b) => b - a);
      setAvailableYears(years);
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  const filteredPayments =
    selectedYear === "all"
      ? paymentDetails
      : paymentDetails.filter(
          (p) => new Date(p.dueDate).getFullYear().toString() === selectedYear
        );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Loan Details</h2>

      {loanDetail && (
        <div className="mb-6 p-4 border rounded shadow-sm bg-white flex gap-10">
          <div className="w-[45%] text-xl">
            <p><strong>Title:</strong> {loanDetail.title}</p>
            <p><strong>Loan Amount:</strong> ₹{loanDetail.amount}</p>
            <p><strong>EMI Amount:</strong> ₹{loanDetail.emiAmount}</p>
            <p><strong>Interest Rate:</strong> {loanDetail.interestRate}%</p>
            <p><strong>Status:</strong> {loanDetail.status}</p>
          </div>
          <div className="w-[45%] text-xl">
            <p>
              <strong>Total Payment Amount: </strong>
              ₹{(loanDetail.emiAmount * loanDetail.tenureMonths).toFixed(2)}{" "}
            </p>
            <p>
              <strong>Total Interest Amount: </strong>
              ₹{(loanDetail.emiAmount * loanDetail.tenureMonths - loanDetail.amount).toFixed(2)}{" "}
            </p>
            <p><strong>Tenure:</strong> {loanDetail.tenureMonths} months</p>
            <p><strong>Start Date:</strong> {new Date(loanDetail.startDate).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {loanDetail  && (
        <div className="my-10">
          <div className="my-10 text-2xl font-bold">
            Loan Analysis
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            {/* Chart 1: Principal vs Interest */}
            <div className="bg-white p-4 rounded shadow w-full md:w-[48%]">
              <h2 className="bold text-lg ">Total Payment: ₹{(loanDetail.emiAmount * loanDetail.tenureMonths).toFixed(2)}</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Principal", value: loanDetail.amount },
                      { name: "Interest", value: loanDetail.emiAmount * loanDetail.tenureMonths - loanDetail.amount },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#8884d8" />
                    <Cell fill="#82ca9d" />
                    
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Paid vs Remaining */}
            <div className="bg-white p-4 rounded shadow w-full md:w-[48%]">
              <h2  className="bold text-lg ">Paid vs Remaining: ₹{(loanDetail.emiAmount * loanDetail.tenureMonths).toFixed(2)}</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Paid", value: totalPaid },
                      {
                        name: "Remaining",
                        value: loanDetail.emiAmount * loanDetail.tenureMonths - totalPaid,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FF8042" />
                    <Label
                      value={``}
                      position="top"
                      fontSize={16}
                      fontWeight="bold"
                      fill="#333"
                    />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}


      <div className="mb-4 flex items-center gap-2">
        <label className="text-lg font-medium">Filter by Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Years</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

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
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => (
                <tr key={payment._id} className="text-center">
                  <td className="border p-2">{payment.emiNumber}</td>
                  <td className="border p-2">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {payment.paidDate
                      ? new Date(payment.paidDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border p-2">₹{payment.amount}</td>
                  <td className={`border p-2 ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </td>
                  <td className="border px-4 py-2">
                    {payment.status === "late" || payment.status === "unpaid" && (
                      <div
                        onClick={() => markAsPaid(payment._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded cursor-pointer"
                      >
                        Mark as Paid
                      </div>
                    )}
                    {payment.status === "paid" && (
                      <span className="text-gray-400">✔</span>
                    )}
                    {payment.status === "upcoming" && (
                      <span className="text-gray-400">Not Available</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border text-center" colSpan="6">
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
