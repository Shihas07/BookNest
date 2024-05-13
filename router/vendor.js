
    const express=require("express")
    const router=  express.Router()
    const vendorController=require("../controller/vendor")
    const vendorAuth = require("../midilware/vendor_jwt")
    
    // const upload = require("../config/multer")


    const multer = require('multer');
    const upload = multer({ dest: 'uploads/' });
    //    const upload = multer({ dest: '/tmp/' });



    router.get("/vendor/index",vendorAuth,vendorController.index)
    router.get("/vendor/register",vendorController.signupGetPage)

     router.post("/vendor/register",vendorController.signupPostPage)

      router.get("/vendor/login",vendorController.getlogin)
      router.post("/vendor/login",vendorController.postLogin)
      router.get("/vendor/signout",vendorController.signout)
      router.get("/vendor/roomlist",vendorAuth,vendorController.roomgetPage)
      router.get("/vendor/addproduct",vendorAuth,vendorController.getaddproduect)

      router.post("/vendor/addroom",vendorAuth, upload.array('roomImage',3),vendorController.postaddroom)
      router.get("/vendor/editroom/:id",vendorController.getEditRoompage)
      router.post("/vendor/editroom",upload.array('roomImage',3),vendorController.postEditRoompage)
      router.post("/vendor/deleteroom/:id",vendorController.deleteRoom)
      router.get("/vendor/booking",vendorAuth,vendorController.getbooking)
     

module.exports=router


