const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const conf = require('config');
const defaultAdmin = conf.defaultAdmin;

const h = require('../misc/helper');

const TestResult = require('../models/testresult');
const PendingTest = require('../models/pendingtest');

// Returns an array containing all results
router.get(
    '/getall',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const query = {};
        TestResult.getAll(
            query,
            (err, testresults) => {
                if (err) {
                    return res.json({ success: false, msg: 'Failed to get testresults' });
                }

                if (testresults.length > 0) {
                    return res.json({
                        success: true,
                        msg: 'Successfuly retrieved testresults!',
                        testresults: testresults
                    });
                } else {
                    return res.json({ success: false, msg: 'No testresults in the database' });
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
      const startDate = req.query.startDate || '1900-01-01';
      const endDate = req.query.endDate || '2300-12-31';
      const status = req.query.status;

      TestResult.getTestResultByDate(
            startDate,
            endDate,
            status,
            (err, testResult) => {
                if (err) {
                    return res.json({ success: false, msg: 'Failed to get test results' });
                }
  
                if (testResult.length > 0) {
                    return res.json({
                        success: true,
                        msg: 'Successfuly retrieved test results!',
                        testResults: testResult
                    });
                } else {
                    return res.json({
                      success: false,
                      msg: 'No test results found within the selected dates',
                      testResults: []
                    });
                }
            }
        )
    }
  )

 // Register
router.post(
    '/register',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        h.dlog('\n\n\nInside TESTRESULT Route - REGISTER Start');
        h.dlog('Adding result of patient ' + req.body.patientName);

        const action = 'Add Result';

        const newResult = new TestResult({
            date_done: new Date(req.body.dateDone),
            patient_id: req.body.patientId,
            patient_name: req.body.patientName,
            patient_address: req.body.patientAddress,
            patient_age: req.body.patientAge,
            patient_gender: req.body.patientGender,
            medtech: req.body.medtech,
            pathologist: req.body.pathologist,
            tests_and_results: req.body.testsAndResults.map(({ transactionId, testName, resultValue, normalValues}) => ({ 
                transaction_id: transactionId,
                test_name: testName,
                result_value: resultValue,
                normal_values: "normalValues"
            }))
        });

        if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
            TestResult.addResult(newResult, (err, result) => {
                h.dlog(req.body);
                h.dlog("    newResult to be added ----------------------------------------");
                h.dlog(newResult);
                if (err) {
                    h.dlog('Error adding user2');
                    return res.status(500).json({
                        success: false,
                        msg: 'Error adding to result'
                    });
                } else {
                    h.dlog('Result registered');

                    let pendingTestId = null;
                    for(const test of req.body.testsAndResults) {
                        pendingTestId = test._id;
                        h.dlog("trying to delete record with id "+ pendingTestId);
                        PendingTest.deleteById(pendingTestId, (err) => {
                            if (err) {
                                h.dlog('Error deleting document: ' + err, 'error');
                            } else {
                                h.dlog('Document deleted successfully.');
                            }
                        });
                    }

                    return res.json(h.appRes(
                        { success: true, msg: 'Result added' },
                        { id: result._id, patientName: result.patientName }
                    ));
                }
            });
        } else {
            h.dlog('User not allowed to ' + action);
            return res.json({ success: false, msg: 'User not allowed to ' + action });
            return res.status(401).json({
                success: false,
                msg: 'Aunauthorized Access: User not allowed to ' + action
            });
        }
    }
);


// Save Urinalysis Result
router.post(
    '/urinalysis/register',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        h.dlog('\n\n\nInside TESTRESULT Urinalysis Route - REGISTER Start');
        h.dlog('Adding result of patient ' + req.body.patientName);
        console.log('------------------------------------');
        console.log('------------------------------------');
        console.log('------------------------------------');
        console.log('req.body');
        console.log(req.body);

        const action = 'Add Result';

        const newResult = {
            date_done: new Date(req.body.dateDone),
            patient: req.body.patient,
            requesting_physician: req.body.requestingPhysician,
            medtech: req.body.medtech,
            pathologist: req.body.pathologist,
            test: req.body.test
        };

        if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
            TestResult.addResult(new TestResult(newResult), (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        msg: 'Error adding to result'
                    });
                } else {
                    h.dlog('Result registered');
                    return res.json(h.appRes(
                        { success: true, msg: 'Result added' },
                        { id: result._id, patientName: result.patientName }
                    ));
                }
            });
        } else {
            h.dlog('User not allowed to ' + action);
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized Access: User not allowed to ' + action
            });
        }
    }
);


// Update TestResult by _id
router.put(
    '/urinalysis/update/:id',
    passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.params.id;

    const action = 'Update Result';

    if (req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
        try {
            // Find the TestResult by _id
            const testResult = await TestResult.findById(id);

            if (!testResult) {
                return res.status(404).json({ success: false, msg: 'TestResult not found' });
            }
            
            // Update only the fields provided in the request body
            for (const key in req.body) {
                if (key in testResult) {
                    testResult[key] = req.body[key];
                }
            }

            // Save the updated TestResult
            const updatedTestResult = await testResult.save();

            h.dlog('Result updated');
            return res.json(h.appRes(
                { success: true, msg: 'Result updated' },
                { id: updatedTestResult._id, patientName: updatedTestResult.patientName }
            ));
        } catch (error) {
            h.dlog(error, 'error');
            return res.status(500).json({ success: false, msg: 'Internal Server Error' });
        }
    } else {
        h.dlog('User not allowed to ' + action);
        return res.status(401).json({
            success: false,
            msg: 'Unauthorized Access: User not allowed to ' + action
        });
    }
});


module.exports = router;
