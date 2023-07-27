const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User Schema
const UserSchema = mongoose.Schema({
  // ALL
  firstname: {
    type: String,
    required: true
  },
  // ALL
  middlename: {
    type: String,
    required: true
  },
  // ALL
  lastname: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  gender: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  // Referring, Patho, Medtech, Radtech
  license: {
    type: String
  },
  // Referring, Patho, Medtech, Radtech
  signatoryName: {
    type: String
  },
  // User (Admin, Manager, Cashier, Medtech, Radtech)
  email: {
    type: String
  },
  password: {
    type: String
  },
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
  const query = { email: email }
  User.findOne(query, callback)
}

module.exports.getUsers = function (query, callback) {
  User.find(query, callback)
}

module.exports.addPatient = function (newPatient, callback) {
  // console.log('Inside User Model - ADDUSER Start');

  // console.log('Will now encrypt the password');

  newPatient.save(callback)

  // console.log('Inside User Model - ADDUSER End');
}

module.exports.addUser = function (newUser, callback) {
  // console.log('Inside User Model - ADDUSER Start');

  // console.log('Will now encrypt the password');
  bcrypt.genSalt(
    10,
    (err, salt) => {
      if (err) throw err

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          // console.log('Password encryption failed');
          throw err
        }
        newUser.password = hash
        newUser.save(callback)
      })
    }
  )

  // console.log('Inside User Model - ADDUSER End');
}

module.exports.updateUser = function (query, set) {
  options = { multi: true }

  const res = User.updateOne(query, set, options, function (err) {
    if (err) return console.error(err)
    // console.log('User update successful');
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

        query = { email: email }
        update = { $set: { password: newPassword } }

        User.updateUser(query, update)
        // console.log('Password updated');
      })
    }
  )
}
