import { Router } from "express";
import { 
    createLoan,
    gettotalLoanValue,
    getUserLoan,
    deleteLoan,
    getLoanById
} from "../controllers/loan.controllers.js";
import { veriftJWt } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(veriftJWt)
router.route("/createLoan").post(createLoan)
router.route("/totalLoan").get(gettotalLoanValue)
router.route("/userLoan").get(getUserLoan)
router.route("/:loanId/deleteLoan").delete(deleteLoan)
router.route("/:loanId/loandata").get(getLoanById)

export default router