

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
  },
  category:[{
    categoryName:{
        type:String,
        required:true
    },
  }],
   coupon:[{
      couponCode:{
        type:String
      },
      discountAmount:{
        type:Number
      },
      validity:{
        type:Date
      },
      couponStatus:{
        type:String
      },
      coupontype:{
        type:String
      },
      startdate:{
        type:Date,
        default:Date.now
      }

   }]
  
})
  
const Admin = mongoose.model("Admin", adminSchema); // Create User model

module.exports = Admin;