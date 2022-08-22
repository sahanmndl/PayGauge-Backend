import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/UserRoutes.js";
import transactionRouter from "./routes/TransactionRoutes.js";

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "30mb", extended: true }))
app.use('/api/user', userRouter)
app.use('/api/transaction', transactionRouter)

mongoose
    .connect(
        process.env.MONGO_URL,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => app.listen(process.env.PORT || 8000))
    .then(() =>
        console.log("CONNECTED TO PORT 8000")
    )
    .catch((err) => console.log(err));