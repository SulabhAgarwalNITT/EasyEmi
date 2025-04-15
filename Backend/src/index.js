import dotenv from "dotenv";
dotenv.config();

import connectDB from "./database/dbconnect.js";
import { app } from "./app.js";

connectDB()
.then(()=> {
    app.on("error", (err)=>(
        console.log("Error after connection", err)
    ))

    app.listen(process.env.PORT || 8000 , ()=>(
        console.log(`app is listening.`)
    ) )
})
.catch( (err) => {
    console.log("Mongo db connection failed !!!", err)
} )