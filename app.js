require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// const connectDB = require('./services/database');
const cors = require('cors')
const app = express();
app.use(cors());
// connectDB();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// mouting route
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

const cronGetMatic = require('./cron');
cronGetMatic.fetch();

module.exports = app;
