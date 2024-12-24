const mongoose =require('mongoose')
const ContactMe =new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide you name']
    },
    email:{
        type:String,
        required:[true,'please your email is required ']
    },
    message:{
        type:String,
        required:[true,'please your message is need ']
    }
})
const ContactUS = mongoose.model('ContactUs',ContactMe)
module.exports=ContactUS;