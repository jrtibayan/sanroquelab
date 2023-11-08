const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// Testresult Schema
const TestResultSchema = mongoose.Schema({
    date_done: {
        type: Date,
        required: true
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    patient_name: {
        type: String,
        required: true
    },
    patient_address: {
        type: String,
        required: true
    },
    patient_age: {
        type: String,
        required: true
    },
    patient_gender: {
        type: String,
        required: true
    },
    medtech: {
        type: String,
        required: true
    },
    pathologist: {
        type: String,
        required: true
    },
    tests_and_results: [
        {
            transaction_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            test_name: {
                type: String,
                required: true
            },
            result_value: {
                type: String,
                required: true
            },
            normal_values: {
                type: String,
                required: true
            }
        }
    ]
});

const TestResult = module.exports = mongoose.model('TestResult', TestResultSchema);


/*************************************************************************************************************************************
 * Test Result
 *************************************************************************************************************************************/

module.exports.addResult = function (newResult, callback) {
    newResult.save(callback);
};