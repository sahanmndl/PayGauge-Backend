import express from "express";
import { createTransaction, deleteTransaction, getBalanceByUserId, getExpenseDetails, getIncomeDetails, getTotalIncomeAndExpense, getTransactionById, getTransactionsByUserId, updateTransaction } from "../controllers/TransactionController.js";

const transactionRouter = express.Router()

transactionRouter.post('/create', createTransaction)
transactionRouter.put('/update/:id', updateTransaction)
transactionRouter.delete('/:id', deleteTransaction)
transactionRouter.get('/:id', getTransactionById)
transactionRouter.get('/user/:id', getTransactionsByUserId)
transactionRouter.get('/user/:id/balance', getBalanceByUserId)
transactionRouter.get('/user/:id/data', getTotalIncomeAndExpense)
transactionRouter.get('/user/:id/income', getIncomeDetails)
transactionRouter.get('/user/:id/expense', getExpenseDetails)

export default transactionRouter