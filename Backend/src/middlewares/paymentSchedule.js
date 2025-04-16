import cron from "node-cron"
import { autoGenerateMonthlyPayment } from "../controllers/payment.controllers.js";

const scheduleEMIJob = () => {
    cron.schedule("5 0 * * *", async () => {
        console.log("Running scheduled EMI and reminder job...");
        await autoGenerateMonthlyPayment();
    });
};

export default scheduleEMIJob;