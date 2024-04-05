
  const User=require('../model/user/user')
  const express=require("express")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")




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


module.exports = {
  homePage,
  signup,
  signupPage,
  login,
  userLogout,
  profile
};
