const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// PendingTest Schema
const PendingTestSchema = mongoose.Schema({
    dateDone: {
        type: Date,
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAddress: {
        type: String,
        required: true
    },
    patientGender: {
        type: String,
        required: true
    },
    patientAge: {
        type: String,
        required: true
    },
    resultParameters: [String],
    testType: {
        type: String
    },
    testName: {
        type: String,
        required: true
    }
});

const PendingTest = module.exports = mongoose.model('PendingTest', PendingTestSchema);


module.exports.getAll = function (callback) {
    PendingTest.find({}, callback)
}

module.exports.deleteById = function(id, callback) {
    PendingTest.findByIdAndDelete(id, callback);
};

module.exports.insert = function (newPendingTest, callback) {
    newPendingTest.save(callback);
}