const jwt=require('jsonwebtoken')
require('dotenv').config()

let vendorAuth=async(req,res,next)=>{
    const token=req.cookies.vendor_jwt;

    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decodedToken)=>{
            if(err){
                res.redirect('/vendor/login')
            }else{
                req.user = decodedToken
                next()
            }
        })
    }else{
        res.redirect('/vendor/login')
        console.log('this is error');
    }
}


module.exports=vendorAuth