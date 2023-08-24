const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const h = require('../misc/helper')

// Lab Test Schema
const LabtestSchema = mongoose.Schema({
  tests: [{
    testName: String,
    price: Number,
    testType: String,
    femaleNormalValue: String,
    maleNormalValue: String,
    isDeleted: Boolean
  }],
  packages: [{
    packageName: String,
    price: Number,
    reagents: [String],
    testIncluded: [String],
    isDeleted: Boolean
  }]
})

const Labtest = module.exports = mongoose.model('Labtest', LabtestSchema)

module.exports.addInitialItems = function (newLabtest, callback) {
  newLabtest.tests = []
  newLabtest.packages = []

  newLabtest.tests.push({
    testName: 'Glucose',
    price: 100,
    testType: 'type 1',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  })
  newLabtest.tests.push({
    testName: 'Chole',
    price: 200,
    testType: 'type 1',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  })
  newLabtest.tests.push({
    testName: 'Trigly',
    price: 300,
    testType: 'type 1',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  })

  newLabtest.packages.push({
    packageName: 'FBS + Chole',
    price: 250,
    reagents: ["Reagent 1", "Reagent 2"],
    testIncluded: ['Chole', 'FBS'],
    isDeleted: false
  })

  newLabtest.packages.push({
    packageName: 'Chole + Trigly',
    price: 450,
    reagents: ["Reagent 1", "Reagent 3"],
    testIncluded: ['Chole', 'Trigly'],
    isDeleted: false
  })

  newLabtest.save(callback)
}

module.exports.getAll = function (callback) {
  Labtest.find(callback)
}

module.exports.updateTestAndPackages = function (updatedTests) {
  const replacementDocument = {
    tests: updatedTests.tests,
    packages: updatedTests.packages
  };
  
  // Use the replaceOne() method to update the document (no need for a specific filter)
  Labtest.replaceOne({}, replacementDocument, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Document replaced successfully', result);
    }
  });
}

module.exports.addTest = function (testToInsert, callback) {
  Labtest.findOne({}, (err, labtest) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    if (!labtest) {
      console.error('Labtest document not found.');
      return callback(new Error('Labtest document not found.'));
    }

    labtest.tests.unshift(testToInsert); // Add the new test to the beginning of the array

    labtest.save((err, updatedLabtest) => {
      if (err) {
        console.error(err);
        return callback(err);
      }
      callback(null, updatedLabtest);
    });
  });
}

module.exports.removeTest = function (email, callback) {

}

module.exports.insertPackage = function (firstName, lastName, callback) {

}

module.exports.deletePackage = function (query, callback) {

}