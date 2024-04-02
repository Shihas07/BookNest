const mongoose=require("mongoose") 

   
    const userSchema= new mongoose.Schema({

      userName:{
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
    phoneNumber:{
        type:String
    }
})
    
const User = mongoose.model("User", userSchema); // Create User model

module.exports = User; // Export the User model