const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const h = require('../misc/helper');


// Person Schema
const UserSchema = mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female']
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    receivePromo: {
        type: Boolean,
        default: false,
        required: true
    },
    isSeniorCitizen: {
        type: Boolean,
        default: false
    },
    seniorIdNumber: {
        type: String
    },
    license: { // Patho, Medtech, Radtech
        type: String
    },
    signatoryName: { // Patho, Medtech, Radtech
        type: String
    },
    password: { // all user
        type: String
    },
    role: { // all user
        type: String
    },
    cashOnHand: {
        type: Number,
        default: 0
    },
    allowedActions: { // all user
        type: [String]
    }
});


const User = module.exports = mongoose.model('User', UserSchema);


/*************************************************************************************************************************************
 * Person
 *************************************************************************************************************************************/


module.exports.getPersonByFirstAndLastName = function (firstName, lastName, callback) {
    const query = {
        firstName: firstName,
        lastName: lastName
    };
    User.findOne(query, callback);
};


module.exports.getPersons = function (query, fieldsToSelect, callback) {
    User.find(query)
        .select(fieldsToSelect)
        .sort({ lastName: 1, firstName: 1, middleName: 1 }) // 1 for ascending order
        .exec(callback);
};


/*************************************************************************************************************************************
 * User
 *************************************************************************************************************************************/


module.exports.getUsers = function (query, callback) {
    User.find(query, callback);
};


module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};


module.exports.getUserByEmail = function (email, callback) {
    const query = { 'email': email };
    User.findOne(query, callback);
};


module.exports.addUser = function (newUser, callback) {
    h.dlog('Will now encrypt the password');
    bcrypt.genSalt(
        10,
        (err, salt) => {
            if (err) throw err;

            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                    h.dlog('Password encryption failed');
                    throw err;
                }
                newUser.password = hash;
                newUser.save(callback);
            });
        }
    );

    h.dlog('Inside User Model - ADDUSER End');
};


module.exports.updateUser = function (query, set) {
    options = { multi: true };

    const res = User.updateOne(query, set, options, function (err) {
        if (err) return h.derror(err);
        h.dlog('User update successful');
    });
};


module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(
        candidatePassword,
        hash,
        (err, isMatch) => {
            if (err) throw err;
            callback(null, isMatch);
        }
    );
};


module.exports.changePassword = function (email, password) {
    bcrypt.genSalt(
        10,
        (err, salt) => {
            if (err) throw err;

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;

                newPassword = hash;

                query = { 'email': email };
                update = { $set: { password: newPassword } };

                User.updateUser(query, update);
                h.dlog('Password updated');
            });
        }
    );
};



/*************************************************************************************************************************************
 * Cashier
 *************************************************************************************************************************************/


module.exports.updateCashOnHand = function (cashierId, oldBalance, amountToAdd) {
    let updateQuery = {};

    if (oldBalance && oldBalance > 0) {
        // If oldBalance is greater than 0, use $inc to increment cashOnHand
        updateQuery = { $inc: { cashOnHand: amountToAdd } };
    } else {
        // If oldBalance is 0 or falsy, set cashOnHand directly
        updateQuery = { cashOnHand: amountToAdd };
    }

    // Update cashOnHand in the database
    User.findByIdAndUpdate(
        cashierId,
        updateQuery,
        (err, updatedUser) => {
            if (err) {
                console.error("Error updating cashOnHand:", err);
            } else {
                console.log("Updated user:", updatedUser);
            }
        }
    );
};


/*************************************************************************************************************************************
 * Patient
 *************************************************************************************************************************************/


module.exports.getPatientById = function (id, callback) {
    User.findById(id, callback);
};


module.exports.addPatient = function (newPatient, callback) {
    newPatient.save(callback);
};