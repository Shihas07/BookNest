
   const mongoose= require("mongoose")
   
   const roomschema=new mongoose.Schema({
         
         roomName: {
            type:String,
         },
           category:{
            type:String,
            required:true
           },
           description:{
             type:String,
             required:true
           },
           price:{
             type:Number,
            //  required:true
           },
           location:{
            type:String,
            require:true
           }, 
           roomImages:{
             type: Array
             }
            

   })

    const room=mongoose.model("Room",roomschema)

    module.exports=room