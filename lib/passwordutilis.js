const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const pathtokey = path.join(__dirname, "..", "rsa_private.pem");


const priv_key = process.env.PRIVATE_KEY
  ? process.env.PRIVATE_KEY.replace(/\\n/g, "\n")
  : fs.readFileSync(pathtokey, "utf8");




function genpassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function validpassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === hashVerify;
}

function issuejwt(user) {
  const _id = user._id;
  const expirein = "1d";

  const payload = {
    sub: _id,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, priv_key, {
    expiresIn: expirein,
    algorithm: "RS256"
  });

  return {
    token: "Bearer " + signedToken,
    expires: expirein
  };
}

module.exports = { genpassword, validpassword, issuejwt };
