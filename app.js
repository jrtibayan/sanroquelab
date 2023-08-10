const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport')
const mongoose = require('mongoose')
const conf = require('config') //  we load the db location from the JSON files
const morgan = require('morgan')

const h = require('./misc/helper')

//  Connect to database
mongoose.connect(
  conf.DBHost,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)

//  On Connection
mongoose.connection.on('connected', () => {
  h.dlog('Connected to database ' + conf.DBHost)

  //  delete test database if we are running test
  if (conf.util.getEnv('NODE_ENV') === 'test') {
    initializeDatabase()
  }
})

//  On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err)
})

const app = express()

// don't show the log when it is test
if (conf.util.getEnv('NODE_ENV') !== 'test') {
  // use morgan to log at command line
  app.use(morgan('combined')) // 'combined' outputs the Apache style LOGs
}

const users = require('./routes/users')
const patients = require('./routes/patients')

const port = 3000
// const port = process.env.PORT || 8080;

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
console.log('Server started on port ' + port);

// initializeDatabase();
});
*/

app.listen(port)
console.log('*************************************************************************')
console.log('********************   Server started on port ' + port + '   ********************')
console.log('*************************************************************************')
// initializeDatabase();

module.exports = app
