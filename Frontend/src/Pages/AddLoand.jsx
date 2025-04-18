import { useState } from "react"
import { apiConnecter } from "../utils/apiconnector"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"

const AddLoan = function () {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    interestRate: "",
    tenureMonths: "",
    startDate: "",
  })

  const navigate = useNavigate()

  function changeHandler(event) {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  async function submitHandler(event) {
    event.preventDefault()

    const loanData = {
        ...formData,
        amount: parseFloat(formData.amount), // Convert amount to number
        interestRate: parseFloat(formData.interestRate), // Convert interestRate to number
        tenureMonths: parseInt(formData.tenureMonths), // Convert tenureMonths to integer
        startDate: new Date(formData.startDate), // Convert startDate to Date object
    };

    try {
      const response = await apiConnecter(
        "POST",
        "/api/v1/loans/createLoan",
        loanData
      )
      console.log(response)
      toast.success(response.data.message || "Loan added successfully")
      setFormData({
        title: "",
        amount: "",
        interestRate: "",
        tenureMonths: "",
        startDate: "",
      })

      

      navigate("/user/dashboard")
    } catch (error) {
      console.error("Error while adding loan:", error)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)]  flex items-center justify-center bg-gray-50">
      <form
        onSubmit={submitHandler}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Add New Loan</h2>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={changeHandler}
          placeholder="Loan Title"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={changeHandler}
          placeholder="Loan Amount"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="number"
          step="0.01"
          name="interestRate"
          value={formData.interestRate}
          onChange={changeHandler}
          placeholder="Interest Rate (%)"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="number"
          name="tenureMonths"
          value={formData.tenureMonths}
          onChange={changeHandler}
          placeholder="Tenure (Months)"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={changeHandler}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-semibold"
        >
          Add Loan
        </button>
      </form>
    </div>
  )
}

export default AddLoan
