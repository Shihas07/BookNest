const jwt=require('jsonwebtoken')
require('dotenv').config()

let vendorAuth=async(req,res,next)=>{
    const token=req.cookies.vendor_jwt;
    // console.log('token',token);
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decodedToken)=>{
            if(err){
                console.log('jwt not');
                res.redirect('/vendor/login')
            }else{
                req.admin=decodedToken
                next()
            }
        })
    }else{
        res.redirect('/vendor/login')
        console.log('this is error');
    }
}


module.exports=vendorAuth