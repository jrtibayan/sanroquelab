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

      it(
        'it should NOT create default admin account if database is NOT empty',
        function (done) {
          chai.request(server)
            .post('/users/authenticate')
            .send({
              email: 'admin',
              password: 'password'
            })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(false)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should allow login of the default admin account',
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

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')
              res.body.should.have.property('token')
              res.body.should.have.property('user')

              localStorage.setItem('id_token', res.body.token) // setting token will make browser recognize user as logged in
              localStorage.setItem('defaultAdmin', res.body.token) // save the token of admin to use it later if need to log in

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should NOT allow login if user used the wrong password',
        function (done) {
          chai.request(server)
            .post('/users/authenticate')
            .send({
              email: defaultAdmin.email,
              password: 'password2'
            })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(false)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should NOT allow login of unauthorized users',
        function (done) {
          chai.request(server)
            .post('/users/authenticate')
            .send({
              email: 'jerictibayan@yahoo.com',
              password: 'password'
            })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(false)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )
    })

    describe('GET /users/profile', function () {
      it(
        'it should NOT display profile if user is NOT logged in',
        function (done) {
          chai.request(server)
            .get('/users/profile')
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(401)
              res.body.should.eql({})

              if (er) done(er)
              else done()
            })
        }
      )
    })

    describe('POST /users/register', function () {
      it(
        'it should NOT allow user to register if user is NOT logged in',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan8',
              middleName: 'Padua8',
              lastName: 'Jeric Tibayan8',
              dateOfBirth: 'bday8',
              email: 'jrhod_baby8@yahoo.com',
              role: 'director2',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(401)
              res.body.should.eql({})

              if (er) done(er)
              else done()
            })
        }
      )
    })

  })

  describe('Admin logged in', function () {
    beforeEach(function () {
      localStorage.removeItem('id_token')
      localStorage.setItem('id_token', localStorage.getItem('defaultAdmin'))
    })

    describe('GET /users/profile', function () {
      it(
        'it should display profile of logged in user',
        function (done) {
          chai.request(server)
            .get('/users/profile')
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('user')

              if (er) done(er)
              else done()
            })
        }
      )
    })

    describe('POST /users/register', function () {
      it(
        'it should allow user to register new user with cashier role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan2',
              middleName: 'Padua2',
              lastName: 'Jeric Tibayan2',
              dateOfBirth: 'bday2',
              email: 'jrhod_baby21@yahoo.com',
              role: 'cashier',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should allow user to register new user with medtech role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan3',
              middleName: 'Padua3',
              lastName: 'Jeric Tibayan3',
              dateOfBirth: 'bday3',
              email: 'jrhod_baby3@yahoo.com',
              role: 'medtech',
              license: 'medtech LICENSE',
              signatoryName: 'signatoryName medtech',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should allow user to register new user with radtech role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan4',
              middleName: 'Padua4',
              lastName: 'Jeric Tibayan4',
              dateOfBirth: 'bday4',
              email: 'jrhod_baby4@yahoo.com',
              role: 'radtech',
              license: 'radtech LICENSE',
              signatoryName: 'signatoryName radtech',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should allow user to register new user with manager role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric5',
              middleName: 'Padua5',
              lastName: 'Tibayan5',
              dateOfBirth: '2019-11-11',
              contactNumber: 'contact 0917',
              email: 'jrhod_baby5@yahoo.com',
              role: 'manager',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')

              if (er) done(er)

              localStorage.setItem('patient01_id', res.body.testOnly.id)
              localStorage.setItem('patient01_fullname', res.body.testOnly.fullName)

              done()
            })
        }
      )

      it(
        'it should allow user to register new user with director role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan6',
              middleName: 'Padua6',
              lastName: 'Jeric Tibayan6',
              dateOfBirth: 'bday6',
              email: 'jrhod_baby6@yahoo.com',
              role: 'director',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(true)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )

      it(
        'it should NOT allow user to register an invalid role',
        function (done) {
          chai.request(server)
            .post('/users/register')
            .send({
              firstName: 'Jeric Tibayan7',
              middleName: 'Padua7',
              lastName: 'Jeric Tibayan7',
              dateOfBirth: 'bday7',
              email: 'jrhod_baby7@yahoo.com',
              role: 'director2',
              gender: 'gender',
              address: 'address'
            })
            .set({ Authorization: localStorage.getItem('id_token') })
            .end(function (err, res) {
              let er = null

              if (err) er = err

              res.should.have.status(200)
              res.body.should.have.property('success').eql(false)
              res.body.should.have.property('msg')

              if (er) done(er)
              else done()
            })
        }
      )
    })

  })
})
