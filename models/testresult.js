const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// Testresult Schema
const TestResultSchema = mongoose.Schema({
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
    newResult.save(callback);
};