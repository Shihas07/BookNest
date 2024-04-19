
  const User=require('../model/user/user')
  const Rooms = require('../model/room');
  const express=require("express")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")
const otpService=require("../services/otp")




const cookieparser=require("cookie-parser")

require('dotenv').config()

const homePage = async (req, res) => {
  try {
 
      if (req.cookies.user_jwt) {
      
          const decodedToken = jwt.verify(req.cookies.user_jwt, process.env.JWT_SECRET);
          console.log(decodedToken);
          const userId = decodedToken.id;
          console.log(userId);
          const user = await User.findById(userId);
          res.render('user/index', { user });
      } else {
          // Render home page without user message
          res.render('user/index');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};



  const signup=(req,res)=>{
       res.render("user/signup")
  }

    const signupPage= async (req,res)=>{ 
                   //extract data from body
        const {userName,email,password,phoneNumber} =req.body
                     //data excit
         if(!(userName,email,password,phoneNumber)){

             res.status(400).send("if the data doesent excit")
         }
         //data alredy excit

       const Userexcicte=    await User.findOne({email})

            if(Userexcicte){

                res.status(400).send("allredy taken")
            }


               //hashing password 

               const hashPassword = await bcrypt.hash(password,10)

               const newUser = new User({
                userName,
                email,
                phoneNumber,
                password: hashPassword,
              });
            await newUser.save()
        
            //jwt token 

         const token=   jwt.sign(
                {
                 id: User._id,
                 name:User.userName,
                 email:User.email,
                 phoneNumber:User.phoneNumber,
 

                },
                
                   process.env.JWt_secret,
                   {
                    expiresIn: "24h",
                  }

            )

            

          res.redirect('/')
           

            

    }
    
    const login = async (req, res) => {
      try {
          // Get data from form
          const { email, password } = req.body;
          console.log(req.body);
          
          if (!(email && password)) {
              return res.status(400).send("Email and password are required");
          }
  
          // Find user in MongoDB
          const user = await User.findOne({ email });
  
          if (!user) {
              return res.status(400).send("User not found");
          }
  
          // Compare hashed passwords
          const hashpassword = await bcrypt.compare(password, user.password);
  
          if (!hashpassword) {
              return res.status(400).send("Invalid password");
          }
  
          // Generate JWT token
          const token = jwt.sign({
              id: user._id, // Include user ID in the token payload
              email: user.email,
          }, process.env.JWT_SECRET, {
              expiresIn: '24h'
          });
  
          // Set JWT token in a cookie
          res.cookie('user_jwt', token, { httpOnly: true, maxAge: 86400000 });
  
          console.log('User logged in successfully, token created');
          // Redirect the user to the home page
          res.redirect('/');
      } catch (error) {
          console.log(error);
          res.status(500).send("Internal Server Error");
      }
  };
  


  //google auth//

//   const googleLogin=async(req,res)=>{
//       if(!req.user){
//        return res.redirect('/failure')
//       }
//      //  console.log('google login email :',req.user.email);
//        let user=await User.findOne({email:req.user.email})
//          if(!user){
//              user=new User({
//                  username:req.user.displayName,
//                  email:req.user.email
//              })
//              await user.save()
//              console.log('user data saved');
//             return res.redirect('/login')
//      }
   
//      console.log('login with google');
//      const token=jwt.sign({
//          id:User._id,
//          name:User.userName,
//          email:User.email,
//      },
//      process.env.JWT_SECRET,
//      {
//          expiresIn:'24h',
//      }
//      );
//      res.cookie('user_jwt',token,{httpOnly:true,maxAge:86400000})
//      console.log('user logged in successfully: token created');
//     return res.redirect('/')
//  }

const googleLogin = async (req, res) => {
  if (!req.user) {
      return res.redirect('/failure');
  }

  try {
      let user = await User.findOne({ email: req.user.email });

      if (!user) {
          user = new User({
              username: req.user.displayName,
              email: req.user.email
          });

          await user.save(); // Corrected here
          console.log('New user data saved');
          return res.redirect('/user/login');
      }

      console.log('Login with Google');
      const token = jwt.sign({
          id: user._id, // Corrected from User._id
          name: user.userName, // Corrected from User.userName
          email: user.email // Corrected from User.email
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.cookie('user_jwt', token, { httpOnly: true, maxAge: 86400000 });
      console.log('User logged in successfully: token created');
      return res.redirect('/');
  } catch (error) {
      console.error('Error during Google login:', error);
      return res.redirect('/failure');
  }
};


 let failureGoogleLogin=async(req,res)=>{
  res.send('error')
}
        
  

let  loginGetOtpPage=async(req,res)=>{
       
  res.render("user/emailotp")
}

//     let postEmail=async(req,res)=>{

//          const {email}=req.body;
//          console.log(email);

//          try {
//           // Check if the email already exists in the database
//           const existingUser = await User.findOne({ email });

//           if (existingUser) {
//             // If the email exists, generate and send the OTP for verification
//             const otp = otpService.generateOTP();
//              // Replace generateOTP with your OTP generation logic
     
//             await otpService.sendOTP(email, otp);

//             return res.status(200).render("user/otpverify",{email});
//           }

//           // If the email doesn't exist, return an error
//           return res.status(400).json({ error: 'Email does not exist' });
//         } catch (error) {
//           console.error('Error sending OTP:', error);
//           res.status(500).json({ error: 'Failed to send OTP' });
//         }
 
//     }


// const postOtpVerify = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     console.log(email, otp);

//     // Check if the provided email and OTP match the stored values
//     if (email && otp) {
//       // Verify the OTP using the getStoredOTP function
//       const storedOTP = otpService.getStoredOTP(email);

//       // Check if the stored OTP matches the provided OTP
//       if (storedOTP && storedOTP === otp) {
//         // If OTP is verified, you can proceed with further actions
//         return res.status(200).json({ message: 'OTP verified successfully' });
//       } else {
//         // If OTP is invalid, return an error
//         return res.status(400).json({ error: 'Invalid OTP' });
//       }
//     } else {
//       // If email or OTP is missing, return an error
//       return res.status(400).json({ error: 'Email and OTP are required' });
//     }
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     res.status(500).json({ error: 'Failed to verify OTP' });
//   }
// };






let postEmail = async (req, res) => {
const { email } = req.body;
console.log(email);

try {
// Check if the email already exists in the database
const existingUser = await User.findOne({ email });

if (existingUser) {
// If the email exists, generate and send the OTP for verification
const otp = otpService.generateOTP();
// Replace generateOTP with your OTP generation logic


await otpService.sendOTP(email, otp);

// Set OTP in a cookie
res.cookie('otp', otp, { maxAge: 900000 }); // Cookie expires in 15 minutes (900000 milliseconds)

return res.status(200).render("user/otpverify", { email });
}

// If the email doesn't exist, return an error
return res.status(400).json({ error: 'Email does not exist' });
} catch (error) {
console.error('Error sending OTP:', error);
res.status(500).json({ error: 'Failed to send OTP' });
}
};


const postOtpVerify = async (req, res) => {
try {
const { email, otp } = req.body;
console.log(email, otp);

// Check if the provided email and OTP match the stored values
if (email && otp) {
// Retrieve the stored OTP from the cookie
const storedOTP = req.cookies.otp;

let user=await User.findOne({email})
// Check if the stored OTP matches the provided OTP
if ( storedOTP === otp) {
 const token = jwt.sign({
   id: user._id,
   name: user.userName,
   email: user.email,
}, process.env.JWT_SECRET, {
   expiresIn: '24h'
});

res.cookie('user_jwt', token, { httpOnly: true, maxAge: 86400000 });

 // If OTP is verified, you can proceed with further actions
 return res.status(200).redirect("/");
} else {
 // If OTP is invalid, return an error
 return res.status(400).json({ error: 'Invalid OTP' });
}
} else {
// If email or OTP is missing, return an error
return res.status(400).json({ error: 'Email and OTP are required' });
}
} catch (error) {
console.error('Error verifying OTP:', error);
res.status(500).json({ error: 'Failed to verify OTP' });
}
};  


  let userLogout=async(req,res)=>{
    res.clearCookie('user_jwt')
    console.log('logout success');
    res.redirect('/')
  }

 

const profile = async (req, res) => {
  const decodedToken = jwt.verify(req.cookies.user_jwt, process.env.JWT_SECRET);
  const userId = decodedToken.id;
  const user = await User.findById(userId);

  res.render('user/profile',{user})
};


const getroompage=async(req,res)=>{
  let rooms = await Rooms.find();
  console.log("rooms :",rooms);
  res.render("user/room-grid-style",{rooms})
}

 const getsingleroom=async(req,res)=>{
     
    const id= req.query.id
    console.log(req.query);

    console.log(id);

    const room=await Rooms.findById(id)
    console.log(room);
     
     res.render("user/singleroom",{room})
 }



module.exports = {
  homePage,
  signup,
  signupPage,
  login,
  userLogout,
  profile,
  getroompage,
  googleLogin,
  failureGoogleLogin,
  loginGetOtpPage,
  postEmail,
  postOtpVerify,
  getsingleroom
};
