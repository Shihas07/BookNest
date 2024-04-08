
    const express=require("express")
    const router=  express.Router()
    const vendorController=require("../controller/vendor")
    const vendorAuth = require("../midilware/vendor_jwt")





    router.get("/vendor/index",vendorAuth,vendorController.index)
    router.get("/vendor/register",vendorController.signupGetPage)

     router.post("/vendor/register",vendorController.signupPostPage)

      router.get("/vendor/login",vendorController.getlogin)
      router.post("/vendor/login",vendorController.postLogin)
      router.get("/vendor/signout",vendorController.signout)
      router.get("/vendor/roomlist",vendorController.roomgetPage)
      router.get("/vendor/addproduct",vendorController.getaddproduect)
    //   router.post("/vendor/addproduct",vendorController.)

module.exports=router

