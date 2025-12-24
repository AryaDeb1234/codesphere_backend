const fs = require("fs");
const path = require("path");
const user = require("../models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;


const pub_key = process.env.PUBLIC_KEY
  ? process.env.PUBLIC_KEY.replace(/\\n/g, "\n")
  : fs.readFileSync(path.join(__dirname, "..", "rsa_public.pem"), "utf8");


console.log("Loaded public key:");
console.log(pub_key.slice(0, 50) + "...");
console.log("Public key ends with:");
console.log(pub_key.slice(-50));


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: pub_key,
  algorithms: ["RS256"],
};


const strategy = new JwtStrategy(options, async (payload, done) => {
  try {
    console.log("Decoded JWT payload:", payload); 

    let existingUser = await user.findById(payload.sub);
    if (existingUser) {
      console.log("User found for JWT:", existingUser._id); 
      return done(null, existingUser);
    } else {
      console.log("No user found for JWT payload");
      return done(null, false);
    }
  } catch (err) {
    console.error("Error in JWT strategy:", err); 
    return done(err, false);
  }
});


module.exports = (passport) => {
  passport.use(strategy);
};
