const jwt = require('jsonwebtoken');
require('dotenv').config();



const disableCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

const userMiddleware = (req, res, next) => {
  const token = req.cookies.user_jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        // Token is invalid, you might want to clear the cookie here
        // and redirect to login page
        console.error("JWT token is invalid");
        return res.redirect('/login');
      } else {
        req.userId = decodedToken.id; 
        next();
      }
    });
  } else {
    // Token is not present, redirect to login page
    console.log("JWT token not found in cookies");
    return res.redirect('/login');
  }
};



module.exports = {userMiddleware,disableCache};