const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const conf = require('config')
const defaultAdmin = conf.defaultAdmin

const h = require('../misc/helper')

const Labtest = require('../models/labtest')

// Profile
router.get(
  '/getall',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {

    // res.json(user: req.user); // original code replaced by the one used below


    return res.json({
      success: true,
      labtests: {
        tests: req.tests,
        packages: req.packages
      }
    })

  }
)

module.exports = router
