
     const jwt = require("jsonwebtoken")
     const Admin = require("../model/admin/admin")
     
     const bcrypt=require('bcrypt')
     const User=require("../model/user/user")
     const nodemailer=require("nodemailer")
     const Rooms=require("../model/room")
     const Excel = require('exceljs');
     const cloudinary = require("../config/cloudinary");
const { json } = require("body-parser")


   //  admin dashboard

   const index = async (req, res) => { 
    try {
        const admin=await Admin.find()
        const users = await User.find().populate('booking.room');

        const booking=await User.find().populate("booking")
        let totalBookings = 0;
       booking.forEach(user => {
            totalBookings += user.booking.length;
        });


        const user=await User.find()
         const totaluser=user.length
         console.log(totaluser)
        console.log(totalBookings)

        const bookingPrices = [];

       
        users.forEach(user => {
            
            user.booking.forEach(booking => {
               
                bookingPrices.push(booking.price);
            });
        });

        const total = bookingPrices.reduce((a, b) => a + b, 0);
        console.log(total);

        const getMonthName = (monthNumber) => {
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          return monthNames[monthNumber];
      };
      
      const bookingsByMonth = {}
      
      // Initialize counts for all months
      for (let i = 0; i < 12; i++) {
          const monthName = getMonthName(i);
          bookingsByMonth[monthName] = 0;
      }
      
      users.forEach(user => {
          user.booking.forEach(booking => {
              const bookingMonth = new Date(booking.checkInDate).getMonth(); // Get month (0-indexed)
              const monthName = getMonthName(bookingMonth);
              bookingsByMonth[monthName]++;
          });
      });

          
        const bookingsByMonthJSON = JSON.stringify(bookingsByMonth);
        console.log(bookingsByMonthJSON);


        const bookingCounts = await User.aggregate([
          
          { $unwind: '$booking' },
          // Group by roomId and count the number of bookings for each room
          { $group: { _id: '$booking.room.roomid', count: { $sum: 1 } } }
      ]);

      // Fetch room details based on roomId
      const roomDetailsPromises = bookingCounts.map(async ({ _id, count }) => {
          const room = await Rooms.findById(_id);
          return { roomName: room.roomName, bookingCount: count };
      });
      const roomData = await Promise.all(roomDetailsPromises);
const roomDataFormatted = roomData.reduce((acc, { roomName, bookingCount }) => {
  acc[roomName] = bookingCount;
  return acc;
}, {});


console.log(roomDataFormatted);


    const  roomDatajson=  JSON.stringify(roomDataFormatted)
      console.log("rfef",roomDatajson);
        
        res.render('admin/index', {admin, total ,totaluser ,totalBookings,bookingsByMonthJSON,roomDatajson }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}; 
 

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
                 name: admin.adminName,
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

const getbooking = async (req, res) => {
  try {
    const usersWithBookings = await User.find({}, 'userName email booking');

    const bookingDetails = [];

    for (const user of usersWithBookings) {
      for (const booking of user.booking) {
        const room = await Rooms.findById(booking.room[0].roomid);

        bookingDetails.push({
          userName: user.userName,
          email: user.email,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          price: booking.price,
          status: booking.staus, 
          orderId: booking._id, 
          userId: user._id,
          roomDetails: room

        });
      }
    }

    // Now, pass bookingDetails to the rendering context
    res.render("admin/booking", { bookingDetails });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).send("Internal Server Error");
  }
};


const postCancelBooking = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    // Check if user ID is provided
    if (!userId) {
      throw new Error("User ID not provided");
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    
    const booking = user.booking.find(booking => booking._id.toString() === orderId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update booking status to 'cancelled'
    booking.staus = "cancel";
    // If booking is cancelled, set checkInDate and checkOutDate to null
    if (booking.staus === "cancel") {
      booking.checkInDate = null;
      booking.checkOutDate = null;
    }

    // Save the updated user document
    await user.save();

    // Redirect to booking details page
    res.redirect("/admin/booking");
  } catch (error) {
    console.error("Error in cancel booking:", error);
    res.status(500).send("Internal Server Error");
  }
};


  //  const postBookingreport=async(req,res)=>{
      
  //      const{ startDate,endDate } =req.body
  //      console.log("body axios",startDate,endDate);

  //        const user=await User.find()
  //         console.log(user);


  //  }
  const postBookingreport = async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const allBookings = await User.aggregate([
            { $unwind: "$booking" },
            {
                $match: {
                    "booking.checkInDate": { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    roomIds: { $addToSet: "$booking.room.roomid" } // Collect all room IDs
                }
            }
        ]);

      
        const roomIds = allBookings.length > 0 ? allBookings[0].roomIds : [];

        const roomDetails = await Rooms.find({ _id: { $in: roomIds } });

        const bookingsWithRoomDetails = await User.aggregate([
            { $unwind: "$booking" },
            {
                $match: {
                    "booking.checkInDate": { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    roomId: "$booking.room.roomid",
                    checkInDate: "$booking.checkInDate",
                    checkOutDate: "$booking.checkOutDate",
                    price: "$booking.price",
                    status: "$booking.staus",
                    payment: "$booking.payment",
                    orderId: "$booking.orderId",
                    paymentId: "$booking.paymentId"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $project: {
                    userId: 1,
                    roomId: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    price: 1,
                    status: 1,
                    payment: 1,
                    orderId: 1,
                    paymentId: 1,
                    userName: { $arrayElemAt: ["$userDetails.userName", 0] },
                    email: { $arrayElemAt: ["$userDetails.email", 0] },
                    phoneNumber: { $arrayElemAt: ["$userDetails.phoneNumber", 0] }
                }
            }
        ]);

        // Add room details to each booking
        const bookingsWithFullDetails = bookingsWithRoomDetails.map(booking => {
            const roomDetail = roomDetails.find(room => room._id.toString() === booking.roomId.toString());
            return { ...booking, roomDetails: roomDetail };
        });

        console.log("bookingreport", bookingsWithFullDetails);

        // CREATE NEW WORKBOOK
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("Bookings");

        // HEADERS TO WORKSHEET
        worksheet.columns = [
            { header: "Room ID", key: "roomId", width: 30 },
            { header: "User Name", key: "userName", width: 20 },
            { header: "Room Name", key: "roomName", width: 20 },
            { header: "Check In Date", key: "checkInDate", width: 20 },
            { header: "Check Out Date", key: "checkOutDate", width: 20 },
            { header: "Price", key: "price", width: 20 },
            { header: "Status", key: "status", width: 20 },
        ];

        // DATA ROWS TO WORKSHEET
        bookingsWithFullDetails.forEach((booking) => {
            worksheet.addRow({
                roomId: booking.roomId,
                userName: booking.userName,
                roomName:booking.roomDetails.roomName,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                price: booking.price,
                status: booking.status,
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=booking_report.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();
    } catch (error) {
        console.error("Error generating Excel report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const postBanner = async (req, res) => {
  try {
    const img = req.file; // Single file object, not an array
    const roomData = req.body;
    
    const { bname, heading } = roomData;

    // Upload the single file to Cloudinary
    const result = await cloudinary.uploader.upload(img.path);
    const imageUrl = result.secure_url;

    // Create a new banner object
    const newBanner = {
      bannerName: bname,
      bannerImages: [imageUrl], // Storing the image URL in an array
      bannerHead: heading
    };

    // Find the admin by ID or any other unique identifier
    const adminId = req.admin.id; // Assuming you have authentication middleware that adds the user ID to req.user
         
    // Find the admin by ID
    const admin = await Admin.findById(adminId);
 console.log(admin)
    // Add the new banner to the admin's banners array
    admin.banner.push(newBanner);

    // Save the updated admin document to the database
    await admin.save();

    // Send a success response
    res.status(200).redirect("/admin/index");
  } catch (error) {
    // Handle any errors
    console.error('Error:', error);
    // Send an error response
    res.status(500).send('Internal Server Error');
  }
};


    const getlistBanner=async(req,res)=>{
      const admin = await Admin.find({}, { banner: 1 });

      const banners = admin.flatMap(adminDoc =>
          adminDoc.banner.flatMap(banner => ({
              bannerName: banner.bannerName,
              bannerHead: banner.bannerHead,
              bannerImages: banner.bannerImages.map(image => image),
              id: banner._id
          }))
      );
        console.log("admin",banners)
         res.render("admin/listbanner",{banners})
    }
            
      
const deletebanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    console.log("Banner ID to delete:", bannerId);

   
    const updatedAdmin = await Admin.findOneAndUpdate(
      { 'banner._id': bannerId },
      { $pull: { banner: { _id: bannerId } } },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).redirect("/admin/listbanner");
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Internal server error' });
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
        deletecouponpost,
        getbooking,
        postCancelBooking,
        postBookingreport,
        postBanner,
        getlistBanner,
        deletebanner
     }




