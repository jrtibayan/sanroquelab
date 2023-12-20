const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const conf = require('config');

const h = require('../misc/helper');

const Transaction = require('../models/transaction')
const TestResult = require('../models/testresult');
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
            /****************************************************** */
            /* 1 - GET ALL TEST FROM PACKAGES AND STORE IN AN ARRAY */
            /****************************************************** */
            // Create an empty array to store all unique test values
            const allTest = [];
            // Iterate over each package in transaction.packages
            newTransaction.packages.forEach(package => {
              // Iterate over each test in the testIncluded array
              package.testIncluded.forEach(test => {
                // Check if the test is not already in allTest array
                if (!allTest.includes(test)) {
                  // Add the test to allTest array
                  allTest.push(test);
                }
              });
            });

            /*********************************************/
            /* 2 - FILTER TEST AND GROUP WITH SAME TYPE */
            /********************************************/
            const sanRoqueData = req.app.locals.sanRoqueData

            // Filter tests based on allTest array
            const filteredTests = sanRoqueData.tests.filter(test => allTest.includes(test.testName));

            // Group tests by type
            const groupedTests = filteredTests.reduce((acc, test) => {
              if (!acc[test.testType]) {
                acc[test.testType] = {
                  type: test.testType,
                  parameters: []
                };
              }
              acc[test.testType].parameters.push(...test.resultParameters);
              return acc;
            }, {});

            /********************************************************/
            /* 3 - ADDED OTHER DATA AND STRUCTURED TO NEEDED FORMAT */
            /********************************************************/
            // Initialize the newTests array
            const newResults = [];
            // Convert groupedTests to the desired format
            for (const type in groupedTests) {
              newResults.push({
                type: groupedTests[type].type,
                parameters: Array.from(new Set(groupedTests[type].parameters)),
                date_done:newTransaction.dateDone,
                patient: {
                  id: newTransaction.patientId,
                  name: newTransaction.patientName,
                  address: newTransaction.patientAddress,
                  gender: newTransaction.patientGender,
                  age: newTransaction.patientAge
                },
                requesting_physician: {
                  name: '1',
                  license:'1'
                },
                medtech: {
                  name: 'Joyce Ann E. Magnaye, RMT',
                  license:'0063961'
                },
                pathologist: {
                  name: 'Celso S. Ramos, MD, FPSP',
                  license:'0046296'
                },
                test: req.body.test,
                status: 'Incomplete',
              });
            }
            // Create a deep copy to avoid modifying the original array
            const modifiedResults = JSON.parse(JSON.stringify(newResults));
            // Modify each object in the array
            modifiedResults.forEach(obj => {
              if (obj.parameters) {
                obj.test = {
                  type: obj.type,
                  parameters: obj.parameters.map(param => ({
                    name: param,
                    value: '1',
                    normal: '1'
                  }))
                };
                delete obj.type;
                delete obj.parameters;
              }
            });

            Transaction.addTransaction(new Transaction(newTransaction), (err, updatedTransaction) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        msg: 'Error adding new transaction'
                    });
                }

                // if adding transaction succeeded, add incomplete result
                let errorOccurred = false;  // Variable to track errors
                // if adding transaction succeedd, add incomplete result
                for(const result of modifiedResults) {
                  TestResult.addResult(new TestResult(result), (err, testResult) => {
                    if (err) {
                      errorOccurred = true;  // Set the variable if an error occurs
                    }
                  });
                }
                
                // Send the response after the loop completes
                if (errorOccurred) {
                  return res.status(500).json({
                    success: false,
                    msg: 'Error adding incomplete result'
                  });
                } else {
                  return res.status(200).json({
                    success: true,
                    msg: 'New transaction added successfully'
                  });
                }
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
