

  const mongoose=require("mongoose")
   
  const adminSchema= new mongoose.Schema({

    adminName:{
      type:String,
      required:true
  },
  email:{
      type:String,
      required:true,
      unique:true
  },
  password:{
      type:String,
      required:true
  }
  
})
  
const Admin = mongoose.model("Admin", adminSchema); // Create User model

module.exports = Admin;