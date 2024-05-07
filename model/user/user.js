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
        required:false
    },
    phoneNumber:{
        type:String
    },
    blocked:{
         type:Boolean
    },
    whishlist:[{
         roomId:{
            type:mongoose.Schema.Types.ObjectId,
         }        
    }],
    booking:[{
        checkInDate:{
                type:Date,
        },
        checkOutDate:{
            type:Date,
        },
        price:{
            type:Number,
        },
        room:[{
            roomid:{
                type:String,
            }

        }],
        payment:{
            type:String
        }

    }]
})
    
const User = mongoose.model("User", userSchema); // Create User model

module.exports = User; // Export the User model