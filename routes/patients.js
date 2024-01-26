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
    mobile: user.mobile,
    email: user.email,
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
          h.dlog('Error adding patient')
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
  async (req, res, next) => {
    // always add on route to make sure there will be req.app.locals['uid'] to be used if there is none
    // i used this to replace session since i cant make it work
    // all supposed session values stored will be stored on local instead and use the userid to differentiate which is the owner of that data
    if (!req.app.locals['uid'+req.user._id]) {
      req.app.locals['uid'+req.user._id] = {};
    }

    const filterName = req.query.name;
    const maxPatient = Number(req.query.max);
    const pageNumber = Number(req.query.page);

    // Function to return an empty array
    const getPatient = () => {
      return new Promise((resolve, reject) => {
        // Split the filterName if it contains a comma
        const nameParts = filterName ? filterName.split(',').map(part => part.trim()) : [];

        // Create a query object
        let query = {};

        if (nameParts.length === 1) {
          // If there is no comma, search for the filterName in firstName, lastName, and middleName
          query = {
            $or: [
              { firstName: { $regex: new RegExp(filterName, 'i') } },
              { lastName: { $regex: new RegExp(filterName, 'i') } },
              { middleName: { $regex: new RegExp(filterName, 'i') } },
            ],
          };
        } else if (nameParts.length === 2) {
          // If there is a comma, use the first part as lastName and the second part as firstName
          query = {
            lastName: { $regex: new RegExp(nameParts[0], 'i') },
            firstName: { $regex: new RegExp(nameParts[1], 'i') },
          };
        }

        // Exclude documents where isActive is explicitly set to false
        query.isActive = { $ne: false };

        // Since any person can be a patient we can just use the get person function and query only those that are with inActive = false
        const fieldsToSelect = 'firstName middleName lastName address dateOfBirth gender address isSeniorCitizen seniorIdNumber ';

        //const query = {isInactive: false};
        User.getPersons(
          query,
          fieldsToSelect,
          (err, patients) => {
            if (err) {
                req.app.locals['uid'+req.user._id].activePatients = null;
                reject({ success: false, msg: 'There was and error while getting all patients.' });
            }

            if (patients) {
              req.app.locals['uid'+req.user._id].activePatients = patients;
            }

            if (patients && patients.length > 0) {
                resolve(patients);
            } else {
              resolve(null);
            }
          }
        )
      });
    };

    if(pageNumber > 0) {
      // if the pageNumber > 0 then it is assumed that user just want to get page from req.session.activePatients

      // if there is no req.app.locals['uid'+req.user._id].activePatients then search for new list
      if(!req.app.locals['uid'+req.user._id].activePatients) {
        try {
          await getPatient();
        } catch (error) {
          // Handle any errors if needed
          console.error(error);
        }
      }

      // req.session.activePatiens will now be available
      const patients = req.app.locals['uid'+req.user._id].activePatients;
      // Calculate start and end indices for pagination
      const startIndex = (pageNumber - 1) * maxPatient;
      const endIndex = startIndex + maxPatient;
      const maxPage = Math.ceil(patients.length / maxPatient);

      // Get the subset of patients for the requested page
      const patientsForPage = patients.slice(startIndex, endIndex);

      res.json({
        success: true,
        msg: 'Successfuly retrieved active patients!',
        patients: patientsForPage,
        maxPage: maxPage
      });
    } else {
      // since no page number was requested it is assumed that user is requesting for new list from database
      try {
        const result = await getPatient();

        if (result && result.length > 0) {
          res.json({
            success: true,
            msg: 'Successfuly retrieved active patients!',
            patients: result
          });
        } else {
          res.json({ success: false, msg: 'There are no active patients found.' });
        }
      } catch (error) {
        // Handle any errors if needed
        console.error(error);
        res.json({ success: false, msg: 'There are no active patients found.' });
      }
    }
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
    newPatient.createdBy = req.user._id;

    // validate if allowed to do action register patient
    if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
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
