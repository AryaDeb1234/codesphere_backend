var express = require('express');
var router = express.Router();

var passport = require("passport");
var { genpassword, validpassword, issuejwt } = require("../lib/passwordutilis"); // JWT utils
var user = require("../models/user");

// POST /login
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;

    const existuser = await user.findOne({ username: username });

    if (!existuser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = validpassword(password, existuser.hash, existuser.salt);

    if (isValid) {
      // Generate JWT token
      const tokenObject = issuejwt(existuser);
 
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: existuser._id,
          username: existuser.username,
        },
        token: tokenObject.token,
        expires: tokenObject.expires,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }
  } catch (err) {
    //console.error("Error in login route:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
});

// POST /register
router.post('/register', async function (req, res, next) {
  let { username, password } = req.body;

  try {
    let existuser = await user.findOne({ username });

    if (existuser) {
      return res.status(400).json({ success: false, message: "User already exists. Please login." });
    }

    let { salt, hash } = genpassword(password);

    let newuser = new user({
      username,
      hash,
      salt
    });

    const saveduser = await newuser.save();

    // Issue JWT on successful registration
    const jwt = issuejwt(saveduser);

    res.status(201).json({
      success: true,
      message: "Registration successful! You can now login.",
      user: {
        id: saveduser._id,
        username: saveduser.username,
      },
      token: jwt.token,
      expires: jwt.expires
    });

  } catch (err) {
   // console.error("Error during registration:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: err.message,
    });
  }
});

// GET /api/current-user (Protected route)
router.get('/api/current-user', passport.authenticate("jwt", { session: false }), function (req, res) {
  // Send back user info if JWT is valid
  return res.status(200).json({
    loggedIn: true,
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
});

// GET /logout (for frontend compatibility, but JWT logout happens client-side)
router.get('/logout', function (req, res, next) {
  // For JWT, we can't invalidate tokens server-side unless using a blacklist
  res.json({
    success: true,
    message: "You have logged out successfully. (Client must delete token.)"
  });
});

// Test route
router.get('/', function (req, res, next) {
  res.json({ message: "API is working" });
});

// Protected test route
router.get('/user/protected', passport.authenticate("jwt", { session: false }), function (req, res, next) {
  res.status(200).json({
    success: true,
    message: "You are now authorized!",
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
});

module.exports = router;
