require('dotenv').config();
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport')
const mongoose = require('mongoose')
const conf = require('config') //  we load the db location from the JSON files
const morgan = require('morgan')

const h = require('./misc/helper')

const LabTest = require('./models/labtest');

//  Connect to database
const dbHost =
  process.env.NODE_ENV === 'test' ? process.env.DB_CONNECTION_STRING_TEST :
  process.env.NODE_ENV === 'development' ? process.env.DB_CONNECTION_STRING :
  process.env.DB_CONNECTION_STRING;

mongoose.connect(
  dbHost,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)

//  On Connection
mongoose.connection.on('connected', () => {
  h.dlog('Connected to database ' + dbHost)

  //  delete test database if we are running test
  if (conf.util.getEnv('NODE_ENV') === 'test' && dbHost === process.env.DB_CONNECTION_STRING_TEST) {
    initializeDatabase()
  }
})

//  On Error
mongoose.connection.on('error', (err) => {
  h.dlog('Database error: ' + err, 'error');
})

const app = express()

// don't show the log when it is test
if (conf.util.getEnv('NODE_ENV') !== 'test') {
  // use morgan to log at command line
  app.use(morgan('combined')) // 'combined' outputs the Apache style LOGs
}

const users = require('./routes/users')
const patients = require('./routes/patients')
const labtests = require('./routes/labtests')
const transactions = require('./routes/transactions')
const testresults = require('./routes/testresults')

const port = process.env.PORT || 3000;

//  CORS Middleware
app.use(cors())

//  Set Static Folder
app.use(express.static(path.join(__dirname, 'public')))

//  Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())
app.use(bodyParser.json({ type: 'application/json' }))

//  Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

require('./config/passport')(passport)

app.use('/users', users)
app.use('/patients', patients)
app.use('/labtests', labtests)
app.use('/transactions', transactions)
app.use('/testresults', testresults)

//  Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint2')
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

function initializeDatabase () {
  mongoose.connection.db.dropDatabase()
}

/*
//  Start Server
app.listen(port, () => {
h.dlog('Server started on port ' + port);

// initializeDatabase();
});
*/

LabTest.getAll(
  (err, data) => {
    if (err) h.dlog('Failed to get labtests');

    if (data.length > 0) {
      app.locals.sanRoqueData = {
        tests: data[0].tests,
        packages: data[0].packages
      };
    }
  }
);

app.listen(port)
h.dlog('*************************************************************************')
h.dlog('********************   Server started on port ' + port + '   ********************')
h.dlog('*************************************************************************')
// initializeDatabase();

module.exports = app
