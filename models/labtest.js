const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const h = require('../misc/helper')

// Lab Test Schema
const LabtestSchema = mongoose.Schema({
  tests: [{
    testName: String,
    price: Number
  }],
  packages: [{
    packageName: String,
    price: Number,
    reagents: [String],
    testIndluded: [String]
  }]
})

const Labtest = module.exports = mongoose.model('Labtest', LabtestSchema)

module.exports.addInitialItems = function (newLabtest, callback) {
  newLabtest.tests = []
  newLabtest.packages = []

  newLabtest.tests.push({
    testName: 'FBS',
    price: 100,
  })
  newLabtest.tests.push({
    testName: 'Chole',
    price: 200,
  })
  newLabtest.tests.push({
    testName: 'Trigly',
    price: 300,
  })

  newLabtest.packages.push({
    packageName: 'FBS + Chole',
    price: 250,
    reagents: [],
    testIncluded: ['Chole', 'FBS']
  })

  newLabtest.packages.push({
    packageName: 'Chole + Trigly',
    price: 450,
    reagents: [],
    testIncluded: ['Chole', 'Trigly']
  })

  newLabtest.save(callback)
}

module.exports.getAll = function (callback) {
  Labtest.find(callback)
}

module.exports.insertTest = function (id, callback) {

}

module.exports.removeTest = function (email, callback) {

}

module.exports.insertPackage = function (firstName, lastName, callback) {

}

module.exports.deletePackage = function (query, callback) {

}