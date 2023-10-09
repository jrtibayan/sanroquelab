const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const conf = require('config');

const h = require('../misc/helper');

const Transaction = require('../models/transaction')


// Returns an array containing all transactions
router.get(
    '/getall',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        console.log('-------------------------------222');
        const query = {} 
        Transaction.getTransactions(
            query,
            (err, transactions) => {
                console.log("\n1")
                if (err) {
                    console.log("\n2")
                    return res.json({ success: false, msg: 'Failed to get transactions' });
                }
                console.log("\n3")

                if (transactions.length > 0) {
                    console.log("\n4")
                    return res.json({
                        success: true,
                        msg: 'Successfuly retrieved transactions!',
                        transactions: transactions
                    });
                    console.log("\n5")
                } else {
                    console.log("\n6")
                    return res.json({ success: false, msg: 'No transactions in the database' });
                }
            }
        )
    }
)


router.post(
    '/register',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        console.log('on route transactions/register')
        const newTransaction = req.body;
        newTransaction.isDeleted = false; // all transaction added will have false value on isDeleted property
        newTransaction.isFullyPaid = false;
        newTransaction.hasResult = false;

        
        if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes("Add Transaction"))) {
            Transaction.addTransaction(new Transaction(newTransaction), (err, updatedTransaction) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        msg: 'Error adding new transaction'
                    });
                }

                return res.status(200).json({
                    success: true,
                    msg: 'New transaction added successfully'
                });
            });
        } else {
            return res.status(401).json({
                success: false,
                error: 'Aunauthorized Access' 
            });
        }
    }
)


router.post(
  '/update',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    h.dlog('\n\n\nUpdating transaction')
    const updatedTransactions = {
        transactions: req.body.transactions,
        packages: req.body.packages
    };
    const action = req.body.action;

    // const email = req.body.email
    // check if new is equals old
    /*if (newPassword === confirmPassword) {
      h.dlog('Cannot update. There are no changes to apply.')
      return res.json({ success: false, msg: 'Cannot update. There are no changes to apply.'})
    }*/

    // find retrieve record
    
    if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
        Transaction.getAll(
            (err, transactions) => {
              h.dlog('Finding all transaction')
      
              if (err) {
                h.dlog('Failed to get transactions')
                return res.json({ success: false, msg: 'Failed to get transactions' })
              }
      
              if (transactions.length > 0) {
                h.dlog('Transaction found')

                query = {};
                Transaction.updateTransaction(query, updatedTransactions);
      
                return res.json({
                  success: true,
                  msg: 'Transaction updated'
                })
              } else {
                h.dlog('No transactions in the database')
                return res.json({ success: false, msg: 'No transactions in the database' })
              }
            }
          )
    } else {
        return res.status(401).json({
            success: false,
            error: 'Aunauthorized Access' 
        });
    }
  }
)

module.exports = router
