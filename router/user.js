const express = require("express");
const router = express.Router(); // Use express.Router() to create a router instance
const userController = require('../controller/user');
const { application } = require('express')


router.get("/", userController.homePage);
router.get("/signup",userController.signup)
router.post("/signup",userController.signupPage)
router.post("/login",userController.login)
// router.get("login",userController.login)
router.get('/userLogout',userController.userLogout)
router.get("/profile",userController.profile)

router.get("/roomlist",userController.getroompage)



module.exports = router;
