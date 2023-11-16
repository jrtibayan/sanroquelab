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
    testName: 'RBS',
    price: 59.375,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'FBS',
    price: 59.375,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'BUA',
    price: 118.75,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'BUN',
    price: 171.25,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'CREA',
    price: 157.5,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'CHOLE',
    price: 121.25,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'TRIGLY',
    price: 288.75,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'HDL',
    price: 188.75,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'LDL',
    price: 188.75,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'SGOT',
    price: 315,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'SGPT',
    price: 315,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'HBA1C',
    price: 985,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'LIPID PROFILE',
    price: 827.5,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'NA',
    price: 492.5,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'K',
    price: 492.5,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });
  newLabtest.tests.push({
    testName: 'CL',
    price: 350,
    testType: 'Blood Chemistry',
    femaleNormalValue: 'female normal value',
    maleNormalValue: 'male normal value',
    isDeleted: false
  });

  newLabtest.packages.push({
    packageName: 'RBS / FBS',
    price: 118.75,
    reagents: ["Reagent 1"],
    testIncluded: ['RBS', 'FBS'],
    isDeleted: false
  });
  newLabtest.packages.push({
    packageName: 'BUA',
    price: 118.75,
    reagents: ["Reagent 1"],
    testIncluded: ['BUA'],
    isDeleted: false
  });
  newLabtest.packages.push({
    packageName: 'BUN',
    price: 171.25,
    reagents: ["Reagent 1"],
    testIncluded: ['BUN'],
    isDeleted: false
  });

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
      h.dlog(err, 'error');
    } else {
      h.dlog('Document replaced successfully ' + result);
    }
  });
}

module.exports.addTest = function (testToInsert, callback) {
  Labtest.findOne({}, (err, labtest) => {
    if (err) {
      h.dlog(err, 'error');
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