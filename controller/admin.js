
     const jwt = require("jsonwebtoken")
     const Admin = require("../model/admin/admin")
     const bcrypt=require('bcrypt')
     const User=require("../model/user/user")
     const nodemailer=require("nodemailer")


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
       
          const getCategorey = async (req, res) => {
            try {
              // Fetch the first Admin document as an example. 
              // You might want to use a more specific query to fetch the desired document.
              const admin = await Admin.findOne();
          
              // Check if admin document was found and has categories
              if (!admin || !admin.category || admin.category.length === 0) {
                return res.render("admin/category", { categories: [] }); // Render with empty categories if none found
              }
          
              // Pass the categories to your view
              // Assuming 'admin.category' contains the categories array you want to display
              res.render("admin/category", { categories: admin.category });
            } catch (error) {
              console.error(error); // Log any errors
              res.status(500).send("Internal Server Error");
            }
          };
          

          const postaddcategory = async (req, res) => {
            try {
              const { category } = req.body;
              console.log(category);
          
              if (!category) {
                return res.status(400).send("category name required");
              }
          
              // Correctly await the findOne operation to get the actual admin document
              let product = await Admin.findOne(); // Consider using a more specific query to find the right document
              console.log(product);
          
              if (!product) {
                return res.status(400).send("admin is not found");
              }
          
              // Since category is already an array in your schema, you can directly push into it
              product.category.push({ categoryName: category }); // Ensure you're using the variable correctly
              await product.save();
              return res.redirect('/admin/category');
            } catch (error) {
              console.error(error); // Log the error for debugging
              res.status(500).send("internal server error");
            }
          };


            
         

          

          const editpostCategory = async(req, res) => {
            try {
              const {id, category} = req.body
              console.log(id);
              // console.log(req);

              const admin = await Admin.findOne()
              let index = admin.category.findIndex(cate => cate._id.toString() === id)
              admin.category[index].categoryName = category

              admin.save()
              
          
              // Respond back to the client
              res.status(200).json({message : "category added successful"}); // Sending a success response
            } catch (error) {
              console.error(error);
              res.status(500).send("Error occurred"); // Sending an error response
            }
          }

            const deletePostCategory=async(req,res)=>{
              const categoryId = req.params.id;
              console.log('Category ID to delete:', categoryId);
          
              try {
              
                  let admin = await Admin.findOne();
                  if (!admin) {
                      return res.status(400).send('Admin not found');
                  }
          
                  
                  admin.category = admin.category.filter(category => category._id.toString() !== categoryId);
          
                  // Save the modified Admin document
                  await admin.save();
          
                  // Redirect or respond as necessary
                  return res.redirect('/admin/category'); 
              } catch (error) {
                  console.log('Error deleting category:', error);
                  return res.status(500).send('Internal server error');
              }
          };

            let getuserList=async(req,res)=>{

              const user=await User.find()
              // console.log(user);
               res.render("admin/user-list",{user})
            }

            const postuserlist=async(req,res)=>{
              try {
                const { userId } = req.body; // Assuming you're sending the user's ID in the request body
                  console.log("ffff",req.body);
                // Find user by ID
                const user = await User.findById(userId);
        console.log(user)
                // Toggle the blocked status
                user.blocked = !user.blocked;
        
                // Save the updated user
                await user.save();
        
                res.redirect('/admin/userlist'); // Redirect back to the user list page
            } catch (error) {
                console.error('Error toggling user status:', error);
                res.status(500).send('Internal Server Error');
            }
            }
            const getcoupenpage = async (req, res) => {
              try {
                  // Assuming you have the admin ID available in the request (req.adminId)
                
          
                  // Find the admin document by its ID
                  const admin = await Admin.findOne();
          
                  // Check if admin document exists
                  if (!admin) {
                      // Handle case where admin document is not found
                      return res.status(404).json({ error: "Admin not found" });
                  }
          
                  // Retrieve the coupon details from the admin document
                  const coupons = admin.coupon;
          
                  // Render the admin/coupen template and pass the coupon details
                  res.render("admin/coupen", { coupons });
              } catch (error) {
                  console.error("Error fetching coupon details:", error);
                  res.status(500).json({ error: "Internal server error" });
              }
          };
          

           
// const postaddcoupen = async (req, res) => {
//   const { couponCode, discountAmount, validity, couponStatus, coupontype } = req.body;

//   try {
//       // Find the admin document by its ID (assuming you have admin ID available in the request)
//       // Example: req.adminId is the ID of the admin
//       const admin = await Admin.findOne();

//       // Push the coupon details into the coupon array field
//       admin.coupon.push({
//           couponCode,
//           discountAmount,
//           validity,
//           couponStatus,
//           coupontype,
        
//           // Add other fields as needed (e.g., enddate)
//       });

//       // Save the updated admin document
//       await admin.save();
//          res.redirect("/admin/coupen")
//       // res.status(200).json({ message: "Coupon added successfully" });
//   } catch (error) {
//       console.error("Error adding coupon:", error);
//       res.status(500).json({ error: "Internal server error" });
//   }
// };






///email coupen send//

const sendCouponEmails = async (users, couponDetails) => {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Provide your email service credentials or use a service like Gmail
    service: 'Gmail',
    auth: {
      user: 'shihas732@gmail.com',
      pass: 'lkox ydmj nigs qnlb'
    }
  });

  // Loop through users and send email to each
  users.forEach(async (user) => {
    // Email content
    const mailOptions = {
      from: 'shihas732@gmail.com',
      to: user.email, // Assuming email is stored in user object
      subject: 'New Coupon Available!',
      html: `
      <p>Dear ${user.userName},</p>
      <p>A new coupon is available for you:</p>
      <p>Coupon Code: ${couponDetails.couponCode}</p>
      <p>Discount Amount: ${couponDetails.discountAmount}</p>
      <p>Validity: ${couponDetails.validity}</p>
      <div style="position: relative;">
        <p style="position: absolute; top: 0; left: 0; opacity: 0;">Thank you for using our service!</p>
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWtzMDUyeGJlaTRmdW85b2I3bzk5YXRyYmVjZWdkNG83NzJrc3N5eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/33zX3zllJBGY8/giphy.gif" alt="Loading Spinner" style="max-width: 100%; height: auto; display: block;">

      </div>
      `
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${user.email}`);
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error);
    }
  });
};

const postaddcoupen = async (req, res) => {
  const { couponCode, discountAmount, validity, couponStatus, coupontype } = req.body;

  try {
    // Find the admin document
    const admin = await Admin.findOne();

    // Push the coupon details into the admin's coupon array
    admin.coupon.push({
      couponCode,
      validity,
      discountAmount,
      couponStatus,
      coupontype,
    });

    // Save the updated admin document
    await admin.save();

    // Fetch all users from the database
    const users = await User.find();

    // Send email with the coupon details to each user
    await sendCouponEmails(users, { couponCode, discountAmount, validity, couponStatus, coupontype });

    // Redirect or respond with success message
    res.redirect("/admin/coupen");
    // res.status(200).json({ message: "Coupon added successfully" });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



          
const deletecouponpost = async (req, res) => {
  try {
    const couponId = req.params.id;
    console.log(couponId);

    const admin = await Admin.findOne();

    // Use correct field name 'coupons' instead of 'coupon'
    admin.coupon = admin.coupon.filter(coupon => coupon._id.toString() !== couponId);

    // Save the updated admin document
    await admin.save();

     res.redirect("/admin/coupen")
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

   
            
          
            


     module.exports = {
        
        index,
        adminSignup,
        login,
        loginPostPage,
        adminLogout,
        getCategorey,
        postaddcategory,
        editpostCategory,
        deletePostCategory,
        getuserList,
        postuserlist,
        getcoupenpage,
        postaddcoupen,
        deletecouponpost
     }




