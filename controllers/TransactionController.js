import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const createTransaction = async (req, res, next) => {
    const { label, note, amount, type, category, timestamp, user } = req.body

    let userExists
    try {
        userExists = await User.find({_id: user})
    } catch (err) {
        return console.log(err)
    }

    if(!userExists) {
        return res.status(400).json({message: "User not found!"})
    }

    const transaction = new Transaction({
        label,
        note,
        amount,
        type,
        category, 
        timestamp,
        user
    })

    try {
        const session = await mongoose.startSession()
        session.startTransaction()
        await transaction.save({session})
        userExists[0].transactions.push({_id: transaction.id})
        await userExists[0].save({session})
        await session.commitTransaction()
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: err})
    }

    return res.status(200).json({transaction})
}

export const updateTransaction = async (req, res, next) => {
    const { label, note, amount, type, category, timestamp } = req.body
    const transactionId = req.params.id

    let transaction
    try {
        transaction = await Transaction.findByIdAndUpdate(transactionId, {
            label, 
            note,
            amount,
            type, 
            category,
            timestamp
        })
    } catch (err) {
        return console.log(err)
    }

    if(!transaction) {
        return res.status(500).json({message: "Unable to update transaction"})
    }

    return res.status(200).json({transaction})
}

export const deleteTransaction = async (req, res, next) => {
    const transactionId = req.params.id

    let transaction
    try {
        transaction = await Transaction.findByIdAndRemove(transactionId).populate('user')
        await transaction.user.transactions.pull(transaction)
        await transaction.user.save()
    } catch (err) {
        return console.log(err)
    }

    if(!transaction) {
        return res.status(500).json({message: "Unable to delete transaction"})
    }

    return res.status(200).json({message: "Transaction deleted!"})
}

export const getTransactionById = async (req, res, next) => {
    const transactionId = req.params.id

    let transaction
    try {
        transaction = await Transaction.findById(transactionId)
    } catch (err) {
        return console.log(err)
    }

    if(!transaction) {
        return res.status(404).json({message: "Transaction not found!"})
    }

    return res.status(200).json({transaction})
}

export const getTransactionsByUserId = async (req, res, next) => {
    const userId = req.params.id

    let userTransactions
    try {
        userTransactions = await User.findById(userId).populate('transactions')
    } catch (err) {
        return console.log(err)
    }

    if(!userTransactions) {
        return res.status(404).json({message: "No transactions found!"})
    }

    return res.status(200).json({transactions: userTransactions})
}

export const getBalanceByUserId = async (req, res, next) => {
    const userId = req.params.id

    let userTransactions
    try {
        userTransactions = await User.findById(userId).populate('transactions')
    } catch (err) {
        return console.log(err)
    }

    if(!userTransactions) {
        return res.status(200).json({balance: 0})
    }

    var balance = 0
    userTransactions.transactions.map(it => {
        balance += it.amount
    })

    return res.status(200).json({balance: balance})
}

export const getTotalIncomeAndExpense = async (req, res, next) => {
    const userId = req.params.id

    let userTransactions
    try {
        userTransactions = await User.findById(userId).populate('transactions')
    } catch (err) {
        return console.log(err)
    }

    if(!userTransactions) {
        return res.status(200).json({totalIncome: 0, totalExpense: 0})
    }

    let transactions = userTransactions.transactions

    var totalIncome = 0, totalExpense = 0
    transactions.map(it => {
        if(it.type === "income") {
            totalIncome += it.amount
        } else {
            totalExpense += it.amount
        }
    })
    
    return res.status(200).json({totalIncome: totalIncome, totalExpense: totalExpense})
}

export const getIncomeDetails = async (req, res, next) => {
    const userId = req.params.id

    let userTransactions
    try {
        userTransactions = await User.findById(userId).populate('transactions')
    } catch (err) {
        return console.log(err)
    }

    if(!userTransactions) {
        return res.status(200).json({
            allowance: 0,
            commission: 0,
            gifts: 0,
            interests: 0,
            investments: 0,
            salary: 0,
            selling: 0,
            miscellaneous: 0
        })
    }

    let transactions = userTransactions.transactions

    var allowance = 0, commission = 0, gifts = 0, interests = 0, investments = 0, salary = 0, selling = 0, miscellaneous = 0
    let incomeJSON = transactions.filter(it => it.type === "income")

    incomeJSON.map(it => {
        if(it.category === "allowance") {
            allowance += it.amount
        } else if (it.category === "comission") {
            commission += it.amount
        } else if (it.category === "gifts") {
            gifts += it.amount
        } else if (it.category === "interests") {
            interests += it.amount
        } else if (it.category === "investments") {
            investments += it.amount
        } else if (it.category === "salary") {
            salary += it.amount
        } else if (it.category === "selling") {
            selling += it.amount
        } else if (it.category === "misc-income") {
            miscellaneous += it.amount
        }
    })

    return res.status(200).json({
        allowance: allowance,
        commission: commission,
        gifts: gifts,
        interests: interests,
        investments: investments,
        salary: salary,
        selling: selling,
        miscellaneous: miscellaneous
    })
}

export const getExpenseDetails = async (req, res, next) => {
    const userId = req.params.id

    let userTransactions
    try {
        userTransactions = await User.findById(userId).populate('transactions')
    } catch (err) {
        return console.log(err)
    }

    if(!userTransactions) {
        return res.status(200).json({
            bills: 0,
            clothing: 0,
            entertainment: 0,
            food: 0,
            purchases: 0,
            subscriptions: 0,
            transportation: 0,
            miscellaneous: 0
        })
    }

    let transactions = userTransactions.transactions

    var bills = 0, clothing = 0, entertainment = 0, food = 0, purchases = 0, subscriptions = 0, transportation = 0, miscellaneous = 0
    let expenseJSON = transactions.filter(it => it.type === "expense")

    expenseJSON.map(it => {
        if(it.category === "bills") {
            bills += it.amount
        } else if (it.category === "clothing") {
            clothing += it.amount
        } else if (it.category === "entertainment") {
            entertainment += it.amount
        } else if (it.category === "food") {
            food += it.amount
        } else if (it.category === "purchases") {
            purchases += it.amount
        } else if (it.category === "subscriptions") {
            subscriptions += it.amount
        } else if (it.category === "transportation") {
            transportation += it.amount
        } else if (it.category === "misc-expense") {
            miscellaneous += it.amount
        }
    })

    return res.status(200).json({
        bills: bills * -1,
        clothing: clothing * -1,
        entertainment: entertainment * -1,
        food: food * -1,
        purchases: purchases * -1,
        subscriptions: subscriptions * -1,
        transportation: transportation * -1,
        miscellaneous: miscellaneous * -1
    })
}