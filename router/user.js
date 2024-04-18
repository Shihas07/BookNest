const express = require("express");
const router = express.Router(); // Use express.Router() to create a router instance
const userController = require('../controller/user');
const { application } = require('express')
const passport=require("passport")


router.get("/", userController.homePage);
router.get("/signup",userController.signup)
router.post("/signup",userController.signupPage)
router.post("/login",userController.login)
// router.get("login",userController.login)
router.get('/userLogout',userController.userLogout)
router.get("/profile",userController.profile)

//google login//

router.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

router.get('/auth/google/callback',
passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/failure'}))

router.get('/success',userController.googleLogin)
router.get('/failure',userController.failureGoogleLogin)
// /otp//
router.get('/loginwithotp',userController.loginGetOtpPage)
router.post("/otpemail",userController.postEmail)
router.post("/otpverify",userController.postOtpVerify)


router.get("/roomlist",userController.getroompage)




module.exports = router;
