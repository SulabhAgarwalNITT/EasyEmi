import { Router } from "express";
import { 
    createInitialPayment,
    deletePayment,
    getAllPaymentForUser,
    getAllPaymentForLoan,
    markPaymentAsPaid,
    deleteAll
} from "../controllers/payment.controllers.js";
import { veriftJWt } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(veriftJWt)

router.route("/:loanId/initialPayment").get(createInitialPayment)
router.route("/:paymentId/deletePayment").delete(deletePayment)
router.route("/deletePayment").delete(deleteAll)
router.route("/getAllPayment").get(getAllPaymentForUser)
router.route("/:loanId/getLoanPaymentsDetails").get(getAllPaymentForLoan)
router.route("/:paymentId/markPaid").patch(markPaymentAsPaid)

export default router