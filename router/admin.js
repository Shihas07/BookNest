
  const express = require("express")
  const router=  express.Router()
  const adminController = require("../controller/admin")
const adminAuth = require("../midilware/admin_jwt")

  // const adminAuth = require('../midilware/admin_jwt');

   
  // const Admin=require('../model/admin/admin')


    

     router.get("/admin/index",adminAuth,adminController.index)
     router.get("/admin/register",adminController.adminSignup)
     router.get("/admin/login",adminController.login)

     router.post("/admin/login",adminController.loginPostPage)

     router.get('/admin/adminLogout',adminController.adminLogout)
     router.get("/admin/category",adminAuth,adminController.getCategorey)
     router.post("/admin/add-category",adminController.postaddcategory)

     router.post("/admin/editCategory",adminController.editpostCategory)
     router.post("/admin/deleteCategory/:id",adminController.deletePostCategory)
     router.get("/admin/userlist",adminController.getuserList)
     router.post("/admin/userlist",adminController.postuserlist)
     router.get("/admin/coupen",adminAuth,adminController.getcoupenpage)
     router.post("/admin/addcoupen",adminController.postaddcoupen)

     router.post("/admin/deletecoupon/:id",adminController.deletecouponpost)

     

     module.exports=router