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
        Labtest.getAll(
            (err, labtests) => {
                if (err) {
                    return res.json({ success: false, msg: 'Failed to get labtests' });
                }

                if (labtests.length > 0) {
                    return res.json({
                        success: true,
                        msg: 'Successfuly retrieved labtests and packages!',
                        tests: labtests[0].tests,
                        packages: labtests[0].packages
                    });
                } else {
                    return res.json({ success: false, msg: 'No labtests in the database' });
                }
            }
        )
    }
)


router.post(
    '/tests/insert',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const newTest = req.body;
        newTest.isDeleted = false; // all test added will have false value on isDeleted property

        if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes("Add Test"))) {
            Labtest.addTest(newTest, (err, updatedLabtest) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        msg: 'Error adding new test'
                    });
                }

                return res.status(200).json({
                    success: true,
                    msg: 'New test added successfully'
                });
            });
        } else {
            return res.status(401).json({
                success: false,
                error: 'Aunauthorized Access' 
            });
        }
    }
)


router.post(
  '/update',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    h.dlog('\n\n\nUpdating Labtest')
    const updatedTests = {
        tests: req.body.tests,
        packages: req.body.packages
    };
    const action = req.body.action;

    // const email = req.body.email
    // check if new is equals old
    /*if (newPassword === confirmPassword) {
      h.dlog('Cannot update. There are no changes to apply.')
      return res.json({ success: false, msg: 'Cannot update. There are no changes to apply.'})
    }*/

    // find retrieve record
    
    if(req.user && req.user.role && (req.user.role === "admin" || req.user.allowedActions && req.user.allowedActions.includes(action))) {
        Labtest.getAll(
            (err, labtests) => {
              h.dlog('Finding all labtest')
      
              if (err) {
                h.dlog('Failed to get labtests')
                return res.json({ success: false, msg: 'Failed to get labtests' })
              }
      
              if (labtests.length > 0) {
                h.dlog('Labtest found')
      
                Labtest.updateTestAndPackages(updatedTests);
      
                return res.json({
                  success: true,
                  msg: 'Labtest updated'
                })
              } else {
                h.dlog('No labtests in the database')
                return res.json({ success: false, msg: 'No labtests in the database' })
              }
            }
          )
    } else {
        return res.status(401).json({
            success: false,
            error: 'Aunauthorized Access' 
        });
    }
  }
)

module.exports = router
