const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const conf = require('config')
const defaultAdmin = conf.defaultAdmin

const h = require('../misc/helper')

const User = require('../models/person')

function prepareNewUser (user) {
  let newPassword = null
  if (conf.util.getEnv('NODE_ENV') === 'test') newPassword = 'password'
  else newPassword = h.randomString(12, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  h.dlog('Generated random password for the user')

  const newUser = new User({
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    contact: {
      mobile: user.mobile,
      email: user.email,
    },
    receivePromo: user.receivePromo,
    allowedActions: user.allowedActions,
    license: user.license,
    password: newPassword,
    isSeniorCitizen: user.isSeniorCitizen,
    seniorIdNumber: user.seniorIdNumber,
    signatoryName: user.signatoryName,
    role: user.role
  })

  // will always make default password upon registering "password"
  // commenting out this line will make the default password a random password that is supposed to be emailed to user
  newUser.password = 'password'

  h.dlog('Prepared newUser')

  return newUser
}

function registerUser (newUser, newPassword, res) {
  User.getUserByEmail(
    newUser.contact.email,
    (err, user) => {
      h.dlog('Finding user with email: ' + newUser.contact.email)

      if (err) throw err

      if (user) {
        h.dlog('User already exist')
        return res.json({ success: false, msg: 'User already exist' })
      }

      h.dlog('User not found. Will add the user')

      h.dlog('Forward newUser to addUser function to add the user')
      User.addUser(newUser, (err, user) => {
        if (err) {
          h.dlog('Error adding user')
          return res.json({ success: false, msg: 'Error adding user' })
        } else {
          h.dlog('User registered')

          if (conf.util.getEnv('NODE_ENV') !== 'test') {
            h.emailRegistrationSuccessful(newUser.contact.email, newPassword, user)
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

// Register
router.post(
  '/register',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    h.dlog('\n\n\nInside USER Route - REGISTER Start')
    h.dlog('Adding user with emailad ' + req.body.email)

    const action = 'register ' + req.body.role
    const newUser = prepareNewUser(req.body)

    if (h.canAddNewRole(action, req.user.role, req.user.allowedActions, req.body.role)) {
      return registerUser(newUser, newUser.password, res)
    } else {
      h.dlog('User not allowed to register ' + newUser.role)
      return res.json({ success: false, msg: 'User not allowed to register ' + newUser.role })
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
            h.dlog('Users exist ' + users[0].contact.email)
            h.dlog('Special procedure will be cancelled')
            return res.json({ success: false, msg: 'Can only execute this operation if the database is empty!' })
          } else {
            h.dlog('No user in the database')
            h.dlog('Adding default admin user')

            const newUser = prepareNewUser(conf.defaultAdmin)

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

                const token = jwt.sign(convertToPlainObj(user), conf.secret)

                return res.json({
                  success: true,
                  msg: 'You are now logged in',
                  token: 'JWT ' + token,
                  user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.contact.email,
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
        email: req.user.contact.email, 
        role: req.user.role
      }
    })

  }
)

module.exports = router
