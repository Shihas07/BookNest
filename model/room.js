
   const mongoose= require("mongoose")
   
   const roomschema=new mongoose.Schema({
         
         roomName: {
            type:String,
            required:true
         },
           categorey:{
            type:String,
            required:true
           },
           description:{
             type:String,
             required:true
           },
           price:{
             type:Number,
             required:true
           },
           location:{
            type:String,
            require:true
           }, 
           imageUrl:{ type: Array },
           Date: {
            type: Date,
            required: true
          },

   })

    const room=mongoose.model("Room",roomschema)

    module.exports=room