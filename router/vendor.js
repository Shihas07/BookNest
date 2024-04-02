
    const express=require("express")
    const router=  express.Router()
    const vendorController=require("../controller/vendor")




    router.get("/vendor/index",vendorController.index)
    router.get("/vendor/register",vendorController.signupGetPage)

     router.post("/vendor/register",vendorController.signupPostPage)

      router.get("/vendor/login",vendorController.getlogin)
      router.post("/vendor/login",vendorController.postLogin)

module.exports=router

