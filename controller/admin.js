
     const jwt = require("jsonwebtoken")
     const Admin = require("../model/admin/admin")
     const bcrypt=require('bcrypt')


   //  admin dashboard
     const index=async(req,res)=>{ 
        res.render('admin/index')
     }

      const adminSignup=async(req,res)=>{
         res.render("admin/register")
      }
      
      const login=async(req,res)=>{
         res.render("admin/login")
      }
      const loginPostPage = async (req, res) => {
         const { email, password } = req.body;
       
         // Ensure email and password are provided
         if (email && password) {
           try {
             // Await the async operation to complete
             const admin = await Admin.findOne({ email: email });
             if (!admin) {
               // If no admin is found, send a response and exit the function

               return res.status(401).render("admin/login",{erroru:"invalid admin"});
             }
             // Corrected password check

             const hashpassword = await bcrypt.compare(password, admin.password);

             if (!hashpassword) {
               // If password doesn't match, send a response and exit the function
               return res.status(401).render("admin/login",{errorp:"invalid password"});
             }
             // Password matches, proceed with login
             const token = jwt.sign({
                 id: admin._id,
                 name: admin.adminname,
                 email: admin.email,
               },
               process.env.JWT_SECRET, {
                 expiresIn: "24h",
               }
             );
             res.cookie("admin_jwt", token, { httpOnly: true, maxAge: 86400000 });
             console.log("successful login");
             return res.redirect('/admin/index');
           } catch (error) {
             console.log("Error on Login Submit.", error);
             return res.status(500).send("Internal Server Error");
           }
         } else {
           // If either email or password is not provided, render the login page again
           return res.render('/admin/login');
         }
       };

         
         //logout//

         let adminLogout=async(req,res)=>{
            res.clearCookie('admin_jwt')
            console.log('logout success');
            res.redirect('/admin/login')
          }
       



     module.exports = {
        
        index,
        adminSignup,
        login,
        loginPostPage,
        adminLogout
     }




