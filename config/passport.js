const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/person')
const conf = require('config')

module.exports = function (passport) {
  const opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
  opts.secretOrKey = process.env.SECRET_KEY

  passport.use(new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      User.getUserById(
        jwt_payload._id,
        (err, user) => {
          if (err) {
            return done(err, false)
          }

          if (user) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        }
      )
    }
  ))
}
