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
                console.log(req.body);
                console.log("    newResult to be added ----------------------------------------");
                console.log(newResult);
                if (err) {
                    h.dlog('Error adding user');
                    return res.status(500).json({
                        success: false,
                        msg: 'Error adding to result'
                    });
                } else {
                    h.dlog('Result registered');

                    let pendingTestId = null;
                    for(const test of req.body.testsAndResults) {
                        pendingTestId = test._id;
                        console.log("trying to delete record with id "+ pendingTestId);
                        PendingTest.deleteById(pendingTestId, (err) => {
                            if (err) {
                                console.error('Error deleting document:', err);
                            } else {
                                console.log('Document deleted successfully.');
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


module.exports = router;
