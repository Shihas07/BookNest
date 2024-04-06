
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


            
          //  const editpostCategory=async(req,res)=>{
                                       
          //             try {
                         
          //               const  roomId =   req.params.id
          //               console.log(roomId);
          //             } catch (error) {
                        
          //             }

          //  }

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
          

          

        
            
          
            


     module.exports = {
        
        index,
        adminSignup,
        login,
        loginPostPage,
        adminLogout,
        getCategorey,
        postaddcategory,
        editpostCategory,
        deletePostCategory
     }




