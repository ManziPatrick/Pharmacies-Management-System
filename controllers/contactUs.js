const ContactUS = require('../models/contactus');

exports.ContactMe = async (req,res)=> {
    const {name,email,message}=req.body;
    try {
        if (!email || !name || !message) {
            return res.status(400).json({message: 'fill the missing flied'})
            
        }
        const newContactUs = new ContactMe({
            name,
            email,
            message
        })
        const savedContactus =await newContactUs.save();
        res.status(201).json(savedContactus)
    } catch (error) {
        res.status(500).json({message:'server error to send message '})
        
    }
    
}

exports.getMessages=async (req,res) => {
    try {
        const messages = await ContactUS.find({})
        if (!messages){
            return res.status(404).json({message:"No message found "})
        }
        res.json(messages)
    } catch (error) {
        
    }
    
}