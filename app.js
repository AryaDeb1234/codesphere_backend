require("dotenv").config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // Import CORS
const mongoose = require("mongoose"); // Import mongoose

// Routes
const authRouter = require('./routes/auth');
const taskRouter = require('./routes/index');

const app = express();

app.use((req, res, next) => {
  console.log("Auth Header:", req.headers.authorization);
  next();
});


// MongoDB Connection
mongoose.connect(process.env.DB_URL)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1); // Stop server if DB connection fails
});

// Passport JWT setup
const passport = require("passport");
require("./config/passport")(passport); // configure passport-jwt

// CORS setup (allow frontend to call API)
app.use(cors({
  origin: [
    "http://localhost:3000",           // Dev frontend
     "https://code-sphere-code.vercel.app/" // Add your deployed frontend URL here
  ],
  allowedHeaders: ["Content-Type", "Authorization"],//extraa line
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize passport (JWT)
app.use(passport.initialize());

// View engine setup (KEEPING EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logger and static files
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRouter);
app.use('/api', taskRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
