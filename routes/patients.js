const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const conf = require('config')

const h = require('../misc/helper')

const User = require('../models/person')

function prepareNewPatient (user) {
  const newPatient = new User({
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    dateOfBirth: new Date(user.dateOfBirth),
    gender: user.gender,
    address: user.address,
    contact: {
      mobile: user.mobile,
      email: user.email
    },
    receivePromo: user.receivePromo,
    isSeniorCitizen: user.isSeniorCitizen,
    seniorIdNumber: user.seniorIdNumber
  })

  h.dlog('Prepared newPatient')

  return newPatient
}

function registerPatient (newUser, newPassword, res) {
  User.getPersonByFirstAndLastName(
    newUser.firstName,
    newUser.lastName,
    (err, user) => {
      h.dlog('Finding patient with fullname: ' + newUser.firstName + ' ' + newUser.lastName)

      if (err) throw err

      if (user) {
        h.dlog('Patient already exist')
        return res.json({ success: false, msg: 'Patient already exist' })
      }

      h.dlog('Patient not found. Will add the patient')

      h.dlog('Forward newPatient to addPatient function to add the patient')
      User.addPatient(newUser, (err, user) => {
        if (err) {
          h.dlog('Error adding user')
          return res.json({ success: false, msg: 'Error adding user' })
        } else {
          h.dlog('User registered')

          if (conf.util.getEnv('NODE_ENV') !== 'test') {
            h.emailRegistrationSuccessful(newUser.email, newPassword, user)
          }

          return res.json(h.appRes(
            { success: true, msg: 'User added' },
            { id: newUser._id, fullName: newUser.lastName + ', ' + newUser.firstName }
          ))
        }
      })
    }
  )
}


// Returns an array containing all active patients
router.get(
  '/getall/active',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    console.log("--------------------")
      // Since any person can be a patient we can just use the get person function and query only those that are with inActive = false
      const query = {};
      const fieldsToSelect = 'firstName middleName lastName address dateOfBirth gender address isSeniorCitizen seniorIdNumber ';
      
      //const query = {isInactive: false};
      User.getPersons(
          query,
          fieldsToSelect,
          (err, patients) => {
              if (err) {
                  return res.json({ success: false, msg: 'There was and error while getting all patients.' });
              }

              if (patients && patients.length > 0) {
                  return res.json({
                      success: true,
                      msg: 'Successfuly retrieved active patients!',
                      patients: patients
                  });
              } else {
                  return res.json({ success: false, msg: 'There are no active patients found.' });
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
    h.dlog('\n\n\nInside PATIENTS Route - REGISTER Start')
    h.dlog('Adding patient with fullname: ' + req.body.firstName + ' ' + req.body.lastName)

    const action = 'Add Patient';

    const newPatient = prepareNewPatient(req.body)

    // validate if allowed to do action register patient
    if (h.userCanDoAction(action, req.user.role, req.user.allowedActions)) {
      return registerPatient(newPatient, null, res)
    } else {
      h.dlog('User not allowed to register ')
      return res.json({ success: false, msg: 'User not allowed to register '})
    }
  }
)

// Change Password
router.post(
  '/update/password',
  (req, res, next) => {
    h.dlog('\n\n\nUpdating User Password')

    const email = req.body.email
    const password = req.body.password
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword

    if (newPassword !== confirmPassword) {
      h.dlog('New password and password confirmation does not match')
      return res.json({ success: false, msg: 'New password and password confirmation does not match' })
    }

    User.getUserByEmail(
      email,
      (err, user) => {
        h.dlog('Finding user with email: ' + email)

        if (err) throw err

        if (!user) {
          h.dlog('User not found')
          return res.json({ success: false, msg: 'User not found' })
        }

        h.dlog('User found')
        User.comparePassword(
          password,
          user.password,
          (err, isMatch) => {
            if (err) throw err

            if (isMatch) {
              h.dlog('Password Match')

              // update the password
              User.changePassword(email, newPassword)

              return res.json({
                success: true,
                msg: 'Password updated'
              })
            } else {
              h.dlog('Wrong password')
              return res.json({ success: false, msg: 'Wrong password' })
            }
          }
        )
      }
    )
  }
)

// Authenticate
router.post(
  '/authenticate',
  (req, res, next) => {
    h.dlog('\n\n\nAuthenticating User')

    const email = req.body.email
    const password = req.body.password

    // if tried to login using admin and password for credential
    // this will command the backend to check if there are existing users
    // if no users are found, register an initial user that have a system admin role
    // that user will then be able login and use the user registration form and add new users
    if (email === 'admin' && password === 'password') {
      h.dlog('Processing special user: admin')

      const query = {} // this will get all from the collection

      User.getUsers(
        query,
        (err, users) => {
          if (err) {
            h.dlog('Failed to get users')
            return res.json({ success: false, msg: 'Failed to get users' })
          }

          if (users.length > 0) {
            h.dlog('Users exist ' + users[0].email)
            h.dlog('Special procedure will be cancelled')
            return res.json({ success: false, msg: 'Can only execute this operation if the database is empty!' })
          } else {
            h.dlog('No user in the database')
            h.dlog('Adding default admin user')

            const newUser = prepareNewPatient(conf.defaultAdmin)

            return registerUser(newUser, newUser.password, res)
          }
        }
      )
    } else {
      User.getUserByEmail(
        email,
        (err, user) => {
          h.dlog('Processing user with email: ' + email)

          if (err) throw err

          if (!user) {
            h.dlog('User not found')
            return res.json({ success: false, msg: 'User not found' })
          }

          User.comparePassword(
            password,
            user.password,
            (err, isMatch) => {
              if (err) throw err

              if (isMatch) {
                function convertToPlainObj (src) {
                  return JSON.parse(JSON.stringify(src))
                }

                const token = jwt.sign(convertToPlainObj(user), process.env.SECRET_KEY)

                return res.json({
                  success: true,
                  msg: 'You are now logged in',
                  token: 'JWT ' + token,
                  user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                  }
                })
              } else {
                return res.json({ success: false, msg: 'Wrong password' })
              }
            }
          )
        }
      )
    }
  }
)

// Profile
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {

    // res.json(user: req.user); // original code replaced by the one used below
    return res.json({
      success: true,
      user: {
        firstName: req.user.firstName, 
        middleName: req.user.middleName, 
        lastName: req.user.lastName, 
        email: req.user.email, 
        role: req.user.role
      }
    })
  }
)

module.exports = router
