const jwt = require('jsonwebtoken');
const { Router } = require("express");
const authRouter = Router();
const { db, pgpHelpers } = require("../utils/database.js");

const secret = 'vada-thambi-yapdi-eruka';


// Logging function
function _log(message) {
  console.log(`[Auth_API] - `, message);
}

// Common error handling middleware
function handleAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      _log(error.stack);
      res.status(500).json({ message: error.message });
    });
  };
}

// Database operations
async function generateAccessToken(userDetail) {
  const payload = {
    id: userDetail.id,
    email: userDetail.username
  };

  const options = { expiresIn: '1h' };

  return jwt.sign(payload, secret, options);
}

async function verifyAccessToken(token) {
  const decoded = jwt.verify(token, secret);
  return decoded;
}

// Routes
authRouter.post("/login", handleAsync(async (req, res) => {
  const data = req.body;
  const userData = await db.oneOrNone(`select * from users where username = '${data?.email}' and password = '${data?.password}' limit 1`)
  if (!userData) {
    res.status(500).json({ message: "Invalid Username or Password!" });
  }
  else{
    const token = await generateAccessToken(userData);
    res.status(200).json(token);
  }

})
);

authRouter.post("/validate", handleAsync(async (req, res) => {
  const data = req.body;
  const result = verifyAccessToken(data.token);
  res.status(200).json(result);
})
);

module.exports = authRouter;
