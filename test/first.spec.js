process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')

const conf = require('config')
const defaultAdmin = conf.defaultAdmin


// eslint-disable-next-line no-unused-vars
const should = chai.should()

// const mongoose = require('mongoose')

// const server = 'http:// localhost:3000'
const server = require('../app')

chai.use(chaiHttp)

localStorage.clear()

describe('MEAN Stack App', function () {
  this.bail(true)
  describe('Not logged in', function () {
    beforeEach(function () {
      localStorage.removeItem('id_token')
    })

    describe('POST /users/authenticate', function () {
      it(
        'it should NOT allow log in when database is empty',
        function (done) {
          chai.request(server)
            .post('/users/authenticate')
            .send({
              email: defaultAdmin.email,
              password: 'password'
            })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              else {
                res.should.have.status(200)
                res.body.should.have.property('success').eql(false)
                res.body.should.have.property('msg')
              }

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should create default admin account if database is empty',
        function (done) {
          chai.request(server)
            .post('/users/authenticate')
            .send({
              email: 'admin',
              password: 'password'
            })
            .end(function (err, res) {
              console.log('Response:', res.body);
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')
              res.body.should.not.have.property('token')

              if (er) done(er)
              else done()
            })
        }
      )
    })
  })
})
