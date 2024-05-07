const express = require("express");
const router = express.Router(); // Use express.Router() to create a router instance
const userController = require('../controller/user');
const { application } = require('express')
const passport=require("passport")
const {userMiddleware,disableCache}=require("../midilware/usermidilware")


router.get("/", userController.homePage);
router.get("/signup",userMiddleware,userController.signup)
router.post("/signup",userController.signupPage)
router.get("/login",userController.getLoginpage)
router.post("/login",disableCache,userMiddleware,userController.login)

router.get('/userLogout',userController.userLogout)
router.get("/profile",userController.profile)

//google login//

router.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

router.get('/auth/google/callback',
passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/failure'}))

router.get('/success',userController.googleLogin)
router.get('/failure',userController.failureGoogleLogin)
// /otp//
router.get('/loginwithotp',disableCache,userMiddleware,userController.loginGetOtpPage)
router.get("/otpverify",disableCache,userMiddleware,userController.getOtpPage)
router.post("/otpemail",disableCache,userMiddleware,userController.postEmail)
router.post("/otpverify",disableCache,userMiddleware,userController.postOtpVerify)



router.get("/roomlist",userController.getroompage)

router.get("/singleroom",userController.getsingleroom)
router.get("/room-search",userController.getRoomSearch)
router.post("/price",userController.postPrice)
router.post("/room/sort",userController.postroomsort)
router.post("/room/filter",userController.postFilter)
// router.post("/booking",userController.bookingPostpage)

router.get("/booking",userController.bookingGetpage)
router.post("/booking",userController.Postbooking)
router.get("/api/users",userController.apigetuser)
router.get("/wishlist",userController.getwhislist)
router.post("/wishlist",userController.postwishlist)

router.post("/couponapply",userController.couponapply)
router.post('/razorPayment',userController.razorpayment)

router.get("/bookingdetails",userController.getbookindetails)
router.post('/cancelbooking',userController.postcancel)


module.exports = router;
