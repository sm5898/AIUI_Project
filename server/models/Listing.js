import mongoose from "mongoose"

export default mongoose.model("Listing",{

 title:String,

 description:String,

 type:String,

 image:String,

 location:{
  lat:Number,
  lng:Number
 },

 availability:String,

 createdBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 }

})