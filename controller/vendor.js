





const Vendor = require('../model/vendor/vendor');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();

const index = async (req, res) => {
    try {
 
        if (req.cookies.vendor_jwt) {
        
            const decodedToken = jwt.verify(req.cookies.vendor_jwt, process.env.JWT_SECRET);
            console.log(decodedToken);
            const vendorId = decodedToken.id;
            console.log(vendorId);
            const vendor = await Vendor.findById(vendorId);

            res.render('vendor/index', { vendor });
        } 
      
        //   console.log(vendor);
        // res.render('vendor/index',{vendor});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const signupGetPage = async (req, res) => {
    res.render("vendor/register");
}

const signupPostPage = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    if (!(name && email && password)) {
        res.status(400).send("Invalid data");
    }

    try {
        const vendorExists = await Vendor.findOne({ email });
        if (vendorExists) {
            res.status(400).send("Email already taken");
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newvendor = new Vendor({
            vendorName: name,
            email,
            password: hashPassword,
        });

        await newvendor.save();

        const token = jwt.sign({
            id: newvendor._id, // Corrected variable name
            name: newvendor.vendorName,
            email: newvendor.email
        }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        console.log(token);
        res.cookie('vendor_jwt', token, { httpOnly: true, maxAge: 86400000 });
        res.redirect("/vendor/index");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const getlogin = async (req, res) => {
    res.render("vendor/login");
}

const postLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!(email && password)) {
        return res.status(400).send("Email and password are required");
      }
  
      const vendor = await Vendor.findOne({ email }); // Use Vendor model properly
  
      if (!vendor) {
        return res.status(400).send("Vendor not found");
      }
  
      const hashPassword = await bcrypt.compare(password, vendor.password);
      if (!hashPassword) {
        return res.status(400).render("vendor/login", { errorp: "Invalid password" });
      }
  
      const token = jwt.sign({
        id: vendor._id,
        email: vendor.email
      }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });
  
      res.cookie('vendor_jwt', token, { httpOnly: true, maxAge: 86400000 });
      console.log('Vendor logged in successfully, token created');
      res.redirect('/vendor/index');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

     const signout=async(req,res)=>{
            
         res.clearCookie("vendor_jwt")
         console.log("logout successfully");
         res.redirect("/vendor/login")

     }

      const roomgetPage=async(req,res)=>{
             
            res.render("vendor/roomlist")
      }
       const getaddproduect=(req,res)=>{
             res.render("vendor/add-product")
       }

module.exports = {
    index,
    signupGetPage,
    signupPostPage,
    getlogin,
    postLogin,
    signout,
    roomgetPage,
    getaddproduect
};



