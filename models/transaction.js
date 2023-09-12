const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// Transaction Schema
const TransactionSchema = mongoose.Schema({
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person', // Reference to Person Collection
        required: false
    },
    transactionDate: {
        type: String,
        required: true
    },
    patient: {
        type: String,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    totalPayment: {
        type: Number,
        required: true
    },
    isFullyPaid: {
        type: Boolean,
        required: true
    },
    hasResult: {
        type: Boolean,
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true
    }
});


const Transaction = module.exports = mongoose.model('Transaction', TransactionSchema);

module.exports.addInitialItems = function (callback) {
    const initialTransaction = new Transaction({
        transactionDate: '2023-08-10', // Replace with actual date
        patient: 'John Doe', // Replace with actual patient name
        subtotal: '100', // Replace with actual subtotal
        discount: '10', // Replace with actual discount
        total: '90', // Replace with actual total
        totalPayment: '90',
        isFullyPaid: true, // Replace with actual value
        hasResult: true,
        isDeleted: false // Replace with actual value
    });
    initialTransaction.save(callback)
}

module.exports.getAll = function (callback) {
    Transaction.find({}, callback)
}


module.exports.getTransactions = function (query, callback) {
    Transaction.find(query, callback)
}


module.exports.addTransaction = function (newTransaction, callback) {
    newTransaction.save(callback);
}

module.exports.updateTransaction = function (query, set) {
    options = { multi: true }
  
    const res = Transaction.updateOne(query, set, options, function (err) {
        console.log('query:', query);
        console.log('set:', query);
      if (err) return h.derror(err)
      h.dlog('Transaction update successful');
    })
  }


  module.exports.deleteTransaction = function(query, callback) {
    Transaction.deleteOne(query, function(err) {
        if (err) {
            return h.derror(err);
        }
        h.dlog('Transaction deletion successful');
        if (typeof callback === 'function') {
            callback();
        }
    });
};


module.exports.updateTestAndPackages = function (updatedTests) {
    const replacementDocument = {
        tests: updatedTests.tests,
        packages: updatedTests.packages
    };

    // Use the replaceOne() method to update the document (no need for a specific filter)
    Labtest.replaceOne({}, replacementDocument, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Document replaced successfully', result);
        }
    });
}

module.exports.addNew = function (testToInsert, callback) {
    Labtest.findOne({}, (err, labtest) => {
        if (err) {
        console.error(err);
        return callback(err);
        }

        if (!labtest) {
        console.error('Labtest document not found.');
        return callback(new Error('Labtest document not found.'));
        }

        labtest.tests.unshift(testToInsert); // Add the new test to the beginning of the array

        labtest.save((err, updatedLabtest) => {
        if (err) {
            console.error(err);
            return callback(err);
        }
        callback(null, updatedLabtest);
        });
    });
    }

module.exports.removeTest = function (email, callback) {

}

module.exports.insertPackage = function (firstName, lastName, callback) {

}

module.exports.deletePackage = function (query, callback) {

}