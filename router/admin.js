
  const express = require("express")
  const router=  express.Router()
  const adminController = require("../controller/admin")
const adminAuth = require("../midilware/admin_jwt")
  // const adminAuth = require('../midilware/admin_jwt');

   
  // const Admin=require('../model/admin')


    

     router.get("/admin/index",adminAuth,adminController.index)
     router.get("/admin/register",adminController.adminSignup)
     router.get("/admin/login",adminController.login)

     router.post("/admin/login",adminController.loginPostPage)

     router.get('/admin/adminLogout',adminController.adminLogout)

     module.exports=router