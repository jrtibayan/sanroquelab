const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// Testresult Schema
const TestResultSchema = mongoose.Schema({
    receiptNumber: {
        type: String
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    status: {
        type: String // Will allways have value. Either Incomplete or Done.
    },
    date_done: {
        type: Date,
        required: true
    },
    patient:{
        id: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        age: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
    },
    medtech: {
        name: {
            type: String,
            required: true
        },
        license: {
            type: String,
            required: true
        },
    },
    pathologist: {
        name: {
            type: String,
            required: true
        },
        license: {
            type: String,
            required: true
        },
    },
    requesting_physician: {
        name: {
            type: String
        },
        license: {
            type: String
        }
    },
    test: {
        type: {
            type: String,
            required: true
        },
        parameters: [{
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            },
            normal: {
                type: String
            }
        }],
    }
});

const TestResult = module.exports = mongoose.model('TestResult', TestResultSchema);


/*************************************************************************************************************************************
 * Test Result
 *************************************************************************************************************************************/

module.exports.getAll = function (query = {}, callback) {
    TestResult.find(query, callback)
}

module.exports.addResult = function (newResult, callback) {
    //newResult.save(callback);
    newResult.save(function(err, savedResult) {
        if (err) {
            console.error(err);
            return callback(err);
        }
        callback(null, savedResult);
    });
};

module.exports.getTestResultByDate = function (startDate, endDate, status, callback) {
    //function (startDate, endDate, status, callback) {
    // Set start date to the first minute of the day
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);

    // Set end date to the last minute of the day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const query = {
        date_done: {
            $gte: adjustedStartDate, // Greater than or equal to start date
            $lte: adjustedEndDate // Less than or equal to end date
        },
        status: status
    };

    //TestResult.find(query, callback);
    TestResult.find(query).sort({ date_done: -1 }).exec(callback);
};