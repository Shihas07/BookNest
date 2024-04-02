
const vendor = require('../model/vendor/vendor')
const bcrypt= require("bcrypt")
const jwt=require("jsonwebtoken")

// require('dotenv').config()


const index=async(req,res)=>{
             res.render("vendor/index")
}
 
const signupGetPage=async(req,res)=>{
          res.render("vendor/register")
}

const signupPostPage=async(req,res)=>{
       const {name,email,password} = req.body
       console.log(name,email,password);
       
         if (!(name,email,password)){
             res.status(400).send("invalid data")
         }

         const vendorexcicte=    await vendor.findOne({email})

            if(vendorexcicte){

                res.status(400).send("allredy taken")
            }

            const hashPassword = await bcrypt.hash(password,10)

            const newvendor = new vendor({
             vendorName:name,
             email,
             password: hashPassword,
           });

           await newvendor.save()

           const token=   jwt.sign(
            {
             id: vendor._id,
             name:vendor.vendorName,
             email:vendor.email
             
             


            },
            
               process.env.JWt_secret,
               {
                expiresIn: "24h",
              }

        )
console.log(token);
        res.redirect("/vendor/index")
}

const getlogin=async(req,res)=>{
      res.render("vendor/login")
}
 

const postLogin = async (req, res) => {
  try {
      // Get data from form
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!(email && password)) {
          return res.status(400).send("Email and password are required");
      }

      // Find user in MongoDB
      const Vendor = await vendor.findOne({ email });

      if (!Vendor) {
          return res.status(400).send("User not found");
      }

      // Compare hashed passwords
      const hashPassword = await bcrypt.compare(password, Vendor.password);
      if (!hashPassword) {
          return res.status(400).render("/vendor/login", { errorp: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign({
          id: vendor._id, // Include user ID in the token payload
          email: vendor.email,
      }, process.env.JWT_SECRET, {
          expiresIn: '24h'
      });

      // Set JWT token in a cookie
      res.cookie('vendor_jwt', token, { httpOnly: true, maxAge: 86400000 });

      console.log('User logged in successfully, token created');
      // Redirect the user to the home page
      res.redirect('/vendor/index');
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
};
 
      


  module.exports={
     index,
     signupGetPage,
     signupPostPage,
     getlogin,
     postLogin
  }