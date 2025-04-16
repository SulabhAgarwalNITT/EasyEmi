import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/apiError.util.js";
import scheduleEMIJob from "./middlewares/paymentSchedule.js";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded( { extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes
import userRouter from "./routes/user.routes.js"
import loanRouter from "./routes/loan.routes.js"
import paymentRouter from "./routes/payment.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/loans", loanRouter)
app.use("/api/v1/payments", paymentRouter)

scheduleEMIJob()

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    }

    // Fallback for other unexpected errors
    console.error(err); // Log the full error for debugging
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

export {app} 