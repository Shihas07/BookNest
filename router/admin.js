
  const express = require("express")
  const router=  express.Router()
  const adminController = require("../controller/admin")
const adminAuth = require("../midilware/admin_jwt")
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
     router.get("/admin/booking",adminAuth,adminController.getbooking)
     router.post("/admin/cancelbooking",adminController.postCancelBooking)

     router.post("/bookingreport",adminAuth,adminController.postBookingreport)
     router.post("/admin/addbanner",adminAuth,upload.single('img'),adminController.postBanner)
     router.get("/admin/listbanner",adminController.getlistBanner)
     router.post("/admin/bannerdelete/:id", adminController.deletebanner);
     router.get("/admin/vendorcontroll",adminController.getvendorlist)
     router.post("/admin/vendorlist",adminController.postblock)


     

     module.exports=router