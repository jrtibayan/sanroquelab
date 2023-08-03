const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const h = require('../misc/helper')

// Person Schema
const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String,
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
  contact: {
    email: String,  
    mobile: String,
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
  // Referring, Patho, Medtech, Radtech
  license: {
    type: String
  },
  // Referring, Patho, Medtech, Radtech
  signatoryName: {
    type: String
  },
  password: {
    type: String
  },
  // User (Admin, Manager, Cashier, Medtech, Radtech)
  role: {
    type: String
  },
  allowedActions: {
    type: [String]
  }
})

const User = module.exports = mongoose.model('User', UserSchema)

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback)
}

module.exports.getPatientById = function (id, callback) {
  User.findById(id, callback)
}

module.exports.getUserByEmail = function (email, callback) {
  const query = { 'contact.email': email }
  User.findOne(query, callback)
}

module.exports.getUsers = function (query, callback) {
  User.find(query, callback)
}

module.exports.addPatient = function (newPatient, callback) {
  newPatient.save(callback)
}

module.exports.addUser = function (newUser, callback) {
  h.dlog('Will now encrypt the password');
  bcrypt.genSalt(
    10,
    (err, salt) => {
      if (err) throw err

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          h.dlog('Password encryption failed');
          throw err
        }
        newUser.password = hash
        newUser.save(callback)
      })
    }
  )

  h.dlog('Inside User Model - ADDUSER End');
}

module.exports.updateUser = function (query, set) {
  options = { multi: true }

  const res = User.updateOne(query, set, options, function (err) {
    if (err) return h.derror(err)
    h.dlog('User update successful');
  })
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(
    candidatePassword,
    hash,
    (err, isMatch) => {
      if (err) throw err
      callback(null, isMatch)
    }
  )
}

module.exports.changePassword = function (email, password) {
  bcrypt.genSalt(
    10,
    (err, salt) => {
      if (err) throw err

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err

        newPassword = hash

        query = { 'contact.email': email }
        update = { $set: { password: newPassword } }

        User.updateUser(query, update)
        h.dlog('Password updated');
      })
    }
  )
}
