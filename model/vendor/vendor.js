

const mongoose=require("mongoose")
   
const vendorSchema= new mongoose.Schema({

  vendorName:{
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
},
blocked:{
    type:Boolean
}

})

const vendor = mongoose.model("vendor", vendorSchema); // Create User model

module.exports = vendor;