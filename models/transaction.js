const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');

// Transaction Schema
const TransactionSchema = mongoose.Schema({
    isDeleted: {
        type: Boolean,
        required: true,
    },
    dateDone: {
      type: Date,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    patientName: {
        type: String,
      required: true
    },
    patientAddress: {
      type: String,
      required: true,
    },
    patientAge: {
      type: String,
      required: true,
    },
    patientGender: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    discount: {
      amount: {
        type: Number,
        required: false,
      },
      discountType: {
        type: String,
        required: false,
      }
    },
    total: {
      type: Number,
      required: true,
    },
    packages: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        packageName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        reagents: {
          type: [String],
          required: false,
        },
        testIncluded: {
          type: [String],
          required: false,
        },
      }
    ],
    payments: [
        {
            paymentDate: {
                type: Date,
                required: true
            },
            receiptNumber: {
              type: Number,
              required: true
            },
            amountPaid: {
                type: Number,
                required: true
            }
        }
      ]
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

module.exports.getTransactionById = function (queryId, callback) {
  const query = {_id: queryId};
  Transaction.findOne(query, callback)
}


module.exports.addTransaction = function (newTransaction, callback) {
    newTransaction.save(callback);
}

module.exports.updateTransaction = function (query, set) {
    options = { multi: true }
  
    const res = Transaction.updateOne(query, set, options, function (err) {
        h.dlog('query: ' + query);
        h.dlog('set: ' + query);
      if (err) return h.derror(err)
      h.dlog('Transaction update successful');
    })
}

module.exports.updateTransactionPayments = function (idToUpdate, payments) {


  query = { '_id': idToUpdate };
  update = { $set: { payments: payments } };

  Transaction.updateTransaction(query, update);
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
          h.dlog(err, 'error');
        } else {
            h.dlog('Document replaced successfully ' + result);
        }
    });
}

module.exports.addNew = function (testToInsert, callback) {
    Labtest.findOne({}, (err, labtest) => {
        if (err) {
          h.dlog(err, 'error');
        return callback(err);
        }

        if (!labtest) {
          h.dlog('Labtest document not found.', 'error');
        return callback(new Error('Labtest document not found.'));
        }

        labtest.tests.unshift(testToInsert); // Add the new test to the beginning of the array

        labtest.save((err, updatedLabtest) => {
        if (err) {
            h.dlog(err, 'error');
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