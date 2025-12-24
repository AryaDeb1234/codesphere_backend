require("dotenv").config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); 
const mongoose = require("mongoose"); 


const authRouter = require('./routes/auth');
const taskRouter = require('./routes/index');

const app = express();

app.use((req, res, next) => {
  console.log("Auth Header:", req.headers.authorization);
  next();
});



mongoose.connect(process.env.DB_URL)
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1); 
});


const passport = require("passport");
require("./config/passport")(passport); 


app.use(cors({
  origin: [
    "http://localhost:3000",           
     "https://code-sphere-code.vercel.app" 
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(passport.initialize());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', authRouter);
app.use('/api', taskRouter);


app.use((req, res, next) => {
  next(createError(404));
});


app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
