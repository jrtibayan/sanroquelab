const conf = require('config')
const defaultAdmin = conf.defaultAdmin
sender = require('../config/gmail')
nodemailer = require('nodemailer')

exports.dlog = function (msg, logType=null) {
  if (conf.debug) {
    if(logType === 'error') console.error(msg);
    else if(logType === 'warn') console.warn(msg);
    else if(logType === 'debug') console.debug(msg);
    else console.log(msg);
  }
}

exports.randomString = function (length, chars) {
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

exports.emailRegistrationSuccessful = function (email, password, user) {
  dlog = function (msg) {
    if (conf.debug) console.log(msg)
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender.email,
      pass: sender.password
    }
  })

  let mailOptions = {
    from: sender.email,
    to: email,
    subject: 'San Roque | You are now a registered user',
    text: 'Congratulations!\n\nYou are now registered to San Roque App.\nPlease use the credentials below for your first login.\nYou may change the password anytime from your dashboard.\n\nEmail: ' + email + '\nPassword: ' + password
  }
  dlog('Prepared mailOptions for mailing later')

  dlog('Will now email user his/her new password')
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      dlog('Failed to email the user')
      dlog(error)
    } else {
      dlog('Email sent')
    }
  })

  mailOptions = {
    from: sender.email,
    to: defaultAdmin.email,
    subject: 'San Roque | ' + user.firstName + ' ' + user.lastName + ' has been registered',
    text: 'A new staff has been registered!\n\nEmail: ' + email + '\nPassword: ' + password
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      dlog('Failed to email the user')
      dlog(error)
    } else {
      dlog('Email sent')
    }
  })
}

exports.canAddNewRole = function (action, loggedUserRole, loggedUserAllowedActions = [], newUserRole) {
  const allowed = {}

  allowed.admin = [
    'register director',
    'register manager',
    'register medtech',
    'register radtech',
    'register cashier'
  ]

  allowed.manager = [
    'register medtech',
    'register radtech',
    'register cashier'
  ]

  if (loggedUserAllowedActions.includes(action) || allowed[loggedUserRole].includes(action)) return true

  return false
}

exports.userCanDoAction = function (action, loggedUserRole, loggedUserAllowedActions = []) {
  const allowed = {}

  allowed.admin = [
    'register testresult',
    'register director',
    'register manager',
    'register medtech',
    'register radtech',
    'register cashier'
  ]

  allowed.manager = [
    'register medtech',
    'register radtech',
    'register cashier'
  ]

  if (loggedUserAllowedActions.includes(action) || allowed[loggedUserRole].includes(action)) return true

  return false
}

// result is the actual response to be returned
// and testProps are additional properties if ever it is only running a test
exports.appRes = function (result, testProps) {
  if (conf.util.getEnv('NODE_ENV') === 'test') result.testOnly = testProps

  return result
}
