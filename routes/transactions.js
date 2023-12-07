const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const conf = require('config');

const h = require('../misc/helper');

const Transaction = require('../models/transaction')
const PendingTest = require('../models/pendingtest');
const { collapseTextChangeRangesAcrossMultipleVersions } = require('typescript');


// Returns an array containing all transactions
router.get(
    '/getall',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        h.dlog('-------------------------------222');
        const query = {} 
        Transaction.getTransactions(
            query,
            (err, transactions) => {
                h.dlog("\n1")
                if (err) {
                    h.dlog("\n2")
                    return res.json({ success: false, msg: 'Failed to get transactions' });
                }
                h.dlog("\n3")

                if (transactions.length > 0) {
                    h.dlog("\n4")
                    return res.json({
                        success: true,
                        msg: 'Successfuly retrieved transactions!',
                        transactions: transactions
                    });
                    h.dlog("\n5")
                } else {
                    h.dlog("\n6")
                    return res.json({ success: false, msg: 'No transactions in the database' });
                }
            }
        )
    }
)


// Returns an array containing all transactions
router.get(
  '/getbydate',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
      Transaction.getTransactionsByDate(
          startDate,
          endDate,
          (err, transactions) => {
              if (err) {
                  return res.json({ success: false, msg: 'Failed to get transactions' });
              }

              if (transactions.length > 0) {
                  return res.json({
                      success: true,
                      msg: 'Successfuly retrieved transactions!',
                      transactions: transactions
                  });
              } else {
                  return res.json({
                    success: false,
                    msg: 'No transactions found within the selected dates',
                    transactions: []
                  });
              }
          }
      )
  }
)


router.post(
    '/register',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        h.dlog('on route transactions/register')
        const newTransaction = req.body;
        newTransaction.isDeleted = false; // all transaction added will have false value on isDeleted property
        newTransaction.isFullyPaid = false;
        newTransaction.hasResult = false;
        newTransaction.createdBy = req.user._id;

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


router.post(
    '/payment/register',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
      h.dlog('\n\n\nAdding Payment To Transaction')
      const newPayment = req.body;
      h.dlog('*******************************');
      h.dlog(newPayment);
      h.dlog('*********************************');
      const action = "Add Payment";
  
      // const email = req.body.email
      // check if new is equals old
      /*if (newPassword === confirmPassword) {
        h.dlog('Cannot update. There are no changes to apply.')
        return res.json({ success: false, msg: 'Cannot update. There are no changes to apply.'})
      }*/
  
      // find retrieve record
      
      if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
          // get record to update
          Transaction.getTransactionById(
            newPayment.idToUpdate,
            (err, transaction) => {
              h.dlog('Finding transaction with id '+newPayment.idToUpdate);
      
              if (err) {
                h.dlog('Failed to get labtests')
                return res.json({ success: false, msg: 'Failed to get transaction' })
              }
      
              if (transaction) {
                h.dlog('TRANSACTION found')
                h.dlog(transaction)
                h.dlog("--------------------------------------");
                h.dlog('transaction.testIncluded');
                //h.dlog(transaction.testIncluded);
                h.dlog("--------------------------------------");
                
                const currentPaid = transaction.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
                
                if(currentPaid + newPayment.amountPaid > transaction.total) {
                  h.dlog('Amount exceeds total')
                  return res.status(400).json({ success: false, msg: 'Payment exceeds total amount to be paid!'});
                }

                if(newPayment.amountPaid <=0 ) {
                  h.dlog('Amount must be greater than 0')
                  return res.status(400).json({ success: false, msg: 'Payment must be greater than 0!'});
                }

                if(transaction.payments.length<1){
                  transaction.payments.push({
                    createdBy: req.user._id,
                    paymentDate: new Date(newPayment.paymentDate),
                    receiptNumber: newPayment.receiptNumber,
                    amountPaid: newPayment.amountPaid
                  });
                } else {
                  transaction.payments.unshift({
                    createdBy: req.user._id,
                    paymentDate: new Date(newPayment.paymentDate),
                    receiptNumber: newPayment.receiptNumber,
                    amountPaid: newPayment.amountPaid
                  });
                }
                h.dlog('Adding of Payments -------------------------------------');

                // if all are good the payments in the transaction is updated
                Transaction.updateTransactionPayments(newPayment.idToUpdate, transaction.payments);
                h.dlog('aFTER Adding of Payments -------------------------------------');
                // if after payment is now fully paid, add the tests to queue for making test results
                if(currentPaid + newPayment.amountPaid === transaction.total) {

                   for(const package of transaction.packages) {
                      for(const test of package.testIncluded) {

                        const testList = req.app.locals.sanRoqueData.tests;
                        const foundTest = testList.find(test2 => test2.testName === test);

                        let paramToPass = [];
                        let testType = null;

                        if (foundTest) {
                          paramToPass = Array.isArray(foundTest.resultParameters) ? JSON.parse(JSON.stringify(foundTest.resultParameters)) : [];
                          testType = foundTest.testType ? foundTest.testType : "UNIDENTIFIED";
                        } else {
                          h.dlog('Test not found');
                        }

                        let ptest = {
                          dateDone: transaction.dateDone,
                          transactionId: transaction._id,
                          patientId: transaction.patientId,
                          patientName: transaction.patientName,
                          patientAddress: transaction.patientAddress,
                          patientGender: transaction.patientGender,
                          patientAge: transaction.patientAge,
                          resultParameters: paramToPass,
                          testType: testType,
                          testName: test
                        };

                        PendingTest.insert(new PendingTest(ptest), (err, pendingTest) => {
                          if (err) {
                              return res.status(500).json({
                                  success: false,
                                  msg: 'Error adding to queue'
                              });
                          }
                        });

                      }
                   }

                   h.dlog(transaction.testIncluded);
                }

                h.sendEmail("jrtibayan@gmail.com", "Received Payment", "P" + newPayment.amountPaid + " received by the cashier");

                return res.json({
                  success: true,
                  msg: 'Payment Added'
                })
              } else {
                h.dlog('No transaction in the database')
                return res.json({ success: false, msg: 'No transaction in the database' })
              }
            }
          );
      } else {
          return res.status(401).json({
              success: false,
              error: 'Aunauthorized Access' 
          });
      }
    }
  )

module.exports = router
