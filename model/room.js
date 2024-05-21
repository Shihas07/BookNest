
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
             },
             amenities:[String],
           
               bedtype:{
                type:String
               },
               
            guest:{
                
              type:Number
            },
            vendor: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Vendor'
          },
          ratingavg : {
            type:Number,
            default:0
          },
          review:[{
            user:{
              type:String
            },
            rating:{
              type:Number,
                         
            },
            comment:{
              type:String
            },
            createdAt: {
              type: Date,
              default: Date.now
            }
          }]

   })

    const room=mongoose.model("Room",roomschema)

    module.exports=room