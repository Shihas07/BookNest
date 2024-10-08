const User = require("../model/user/user");
const Rooms = require("../model/room");
const express = require("express");
// const bcrypt = require("bcrypt");
const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");
const otpService = require("../services/otp");
const Admin = require("../model/admin/admin");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");

require("dotenv").config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const cookieparser = require("cookie-parser");
const { log } = require("handlebars");

require("dotenv").config();

const homePage = async (req, res) => {
  try {
    if (req.cookies.user_jwt) {
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      console.log(decodedToken);
      const userId = decodedToken.id;
      console.log(userId);
      const user = await User.findById(userId);
      const rooms=await Rooms.find()
      res.render("user/index", { user,rooms });
    } else {
      
      res.render("user/index");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const signup = (req, res) => {
  res.render("user/signup");
};

const signupPage = async (req, res) => {

  const { userName, email, password, phoneNumber } = req.body;
  
  if (!(userName, email, password, phoneNumber)) {
    res.status(400).send("if the data doesent excit");
  }
  

  const Userexcicte = await User.findOne({ email });

  if (Userexcicte) {
    res.status(400).send("allredy taken");
  }

  //hashing password

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    userName,
    email,
    phoneNumber,
    password: hashPassword,
  });
  await newUser.save();

 

  const token = jwt.sign(
    {
      id: User._id,
      name: User.userName,
      email: User.email,
      phoneNumber: User.phoneNumber,
    },

    process.env.JWt_secret,
    {
      expiresIn: "24h",
    }
  );

  res.redirect("/");
};

const getLoginpage = async (req, res) => {
  res.render("user/login");
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!(email && password)) {
      return res.status(400).redirect("/login");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("user/login",{errop:"invali email"});
    }

    if (user.blocked) {
      return res.status(400).render("user/login",{erroru:"Your account has been blocked. Please contact the administrator"});
    }

    const hashpassword = await bcrypt.compare(password, user.password);

    if (!hashpassword) {
      return res.status(400).render("user/login",{erroru:"Invalid password"});
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 });

    console.log("User logged in successfully, token created");
    
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


//google auth//

const googleLogin = async (req, res) => {
  if (!req.user) {
    return res.redirect("/failure");
  }

  try {
    let user = await User.findOne({ email: req.user.email });

    if (!user) {
      user = new User({
        username: req.user.displayName,
        email: req.user.email,
      });

      await user.save(); // Corrected here
      console.log("New user data saved");
      return res.redirect("/user/login");
    }

    console.log("Login with Google");
    const token = jwt.sign(
      {
        id: user._id, // Corrected from User._id
        name: user.userName, // Corrected from User.userName
        email: user.email, // Corrected from User.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 });
    console.log("User logged in successfully: token created");
    return res.redirect("/");
  } catch (error) {
    console.error("Error during Google login:", error);
    return res.redirect("/failure");
  }
};

let failureGoogleLogin = async (req, res) => {
  res.send("error");
};

let loginGetOtpPage = async (req, res) => {
  res.render("user/emailotp");
};

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
      res.cookie("otp", otp, { maxAge: 900000 }); // Cookie expires in 15 minutes (900000 milliseconds)

      return res.status(200).render("user/otpverify", { email });
    }

    // If the email doesn't exist, return an error
    return res
      .status(400)
      .render("user/emailotp", { errorp: "Email does not exist" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const getOtpPage = async (req, res) => {
  res.render("user/otpverify");
};

const postOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("kjsksk", email, otp);

    // Check if the provided email and OTP match the stored values
    if (email && otp) {
      // Retrieve the stored OTP from the cookie
      const storedOTP = req.cookies.otp;

      let user = await User.findOne({ email });
      // Check if the stored OTP matches the provided OTP
      if (storedOTP === otp) {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.userName,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 });

        // If OTP is verified, you can proceed with further actions
        return res.status(200).redirect("/");
      } else {
        // If OTP is invalid, return an error
        return res.status(400).json({ error: "Invalid OTP" });
      }
    } else {
      // If email or OTP is missing, return an error
      return res.status(400).json({ error: "Email and OTP are required" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

let userLogout = async (req, res) => {
  res.clearCookie("user_jwt");
  console.log("logout success");
  res.redirect("/");
};

const profile = async (req, res) => {
  try {
    if (req.cookies.user_jwt) {
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      const userId = decodedToken.id;

      console.log(userId);
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }


      // Use aggregation to fetch booking details with room information
      const bookingss = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // Match user by ID
        { $unwind: { path: "$booking" } },
        { $unwind: { path: "$booking.room" } },
        {
          $lookup: {
            from: "rooms",
            let: {
              roomid: {
                $toObjectId: "$booking.room.roomid",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$roomid"] },
                },
              },
            ],
            as: "booking.roomDetails",
          },
        },
      ]);
      bookingss.forEach((booking) => {
        if (booking.booking.checkInDate) {
          booking.booking.checkInDateFormatted = new Date(booking.booking.checkInDate).toLocaleDateString("en-GB");
        }
        if (booking.booking.checkOutDate) {
          booking.booking.checkOutDateFormatted = new Date(booking.booking.checkOutDate).toLocaleDateString("en-GB");
        }
        if (booking.createdAt) {
          booking.createdAtFormatted = new Date(booking.createdAt).toLocaleDateString("en-GB");
        }
      });
  
      bookingss.reverse();
  

      console.log("checking booking  : ", bookingss);

      res.status(200).render("user/profile",{bookingss, user})
    }
  } catch (err) {
    // Handle JWT verification errors or database errors
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// const getroompage = async (req, res) => {
//   try {
//     let rooms = await Rooms.find();
//     let user = null;

//     if (req.cookies.user_jwt) {
//       const decodedToken = jwt.verify(
//         req.cookies.user_jwt,
//         process.env.JWT_SECRET
//       );
//       console.log(decodedToken);
//       const userId = decodedToken.id;
//       console.log(userId);
//       user = await User.findById(userId);

//     }
//     console.log("ddd",user)

//     res.render("user/room-grid-style", { rooms, user });
//   } catch (error) {
//     console.error("Error getting room page:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

const getroompage = async (req, res) => {
  try {
    let rooms = await Rooms.find().populate('review');
    let user = null;

    if (req.cookies.user_jwt) {
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      // console.log(decodedToken);
      const userId = decodedToken.id;
      // console.log(userId);
      let user = await User.findById(userId).populate("whishlist.roomId");

     
      const roomIds = user.whishlist.map((item) => item.roomId);
                // console.log(roomIds)             
     
      const wishlistRooms = await Rooms.find({ _id: { $in: roomIds } });
      // console.log("wihl", wishlistRooms);

      const admin = await Admin.find({}, { banner: 1 });

      const banners = admin.flatMap(adminDoc =>
          adminDoc.banner.flatMap(banner => ({
              bannerName: banner.bannerName,
              bannerHead: banner.bannerHead,
              bannerImages: banner.bannerImages.map(image => image)
          }))
      );


             console.log(rooms)




     
      res.render("user/room-grid-style", { rooms, wishlistRooms, user, roomIds, banners });
    } else {
     
      res.render("user/room-grid-style", { rooms, user });
    }
  } catch (error) {
    console.error("Error getting room page:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getsingleroom = async (req, res) => {
  try {
      const id = req.query.id;

      const room = await Rooms.findById(id);
      console.log(room);

      const userIds = room.review.map(review => review.user);

      console.log(userIds);

      const users = await User.find({ _id: { $in: userIds } });

      const userMap = {}; // Map to store user names by user ID
      users.forEach(user => {
          userMap[user._id] = user.userName; // Storing user name by user ID
      });

      room.review.forEach((review) => {
          const userName = userMap[review.user];
          if (userName) {
              review.user = userName;
          } else {
              console.error(`User name not found for review with user ID ${review.user}`);
          }
      });

      const admin = await Admin.find({}, { banner: 1 });
      console.log("admin",admin)
      const banners = admin.flatMap(adminDoc =>
        adminDoc.banner.flatMap(banner => ({
            bannerName: banner.bannerName,
            bannerHead: banner.bannerHead,
            bannerImages: banner.bannerImages.map(image => image)
        }))
    );


      res.render("user/singleroom", { room,banners });
  } catch (error) {
      console.error('Error fetching room details:', error);
      res.status(500).send('An error occurred while fetching room details.');
  }
};




// let getRoomSearch = async (req, res) => {
//   const location = req.query.location;
//   // console.log(location);

//   const room = await Rooms.find({ location });
//   // console.log(",ms,m,s", room);
  

//   res.render("user/room-search", { room });
// };


let getRoomSearch=async(req,res)=>{
  try {
    const { start_date, end_date, location } = req.query;

      

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

  

    // Find all rooms
    const room = await Rooms.find({ location: location[0] });

    // Get all bookings that overlap with the requested date range
    const overlappingBookings = await User.find({
        $and: [
            { 'booking.checkInDate': { $lt: endDate } },
            { 'booking.checkOutDate': { $gt: startDate } }
        ]
    });

      // console.log("overlapping",overlappingBookings)



    // Extract room IDs from the overlapping bookings
    const bookedRoomIds = overlappingBookings.flatMap(user => user.booking.map(booking => booking.room));
           
    // Filter rooms based on availability
    const availableRooms = room.filter(room => !bookedRoomIds.includes(room.roomid));
// console.log("avail",availableRooms);
res.render("user/room-search", {availableRooms,room  });

} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
}






const postPrice = (req, res) => {
  console.log("edbjbdwljdjadjewh");
  const { checkOutDate } = req.body;
  console.log("Received Check-Out Date:", checkOutDate);
  // console.log("Received request body:", req.body);
  const roomPrice = 5000; // Room price per night
  const totalPrice = roomPrice;

  res.send(totalPrice.toString());
};

const postroomsort = async (req, res) => {
  try {
    const { rooms, sortBy } = req.body;
    // console.log(req.body)

    let sortQuery = {};

    if (sortBy === "low-to-high") {
      sortQuery = { price: 1 }; // Sort by price in ascending order
    } else if (sortBy === "high-to-low") {
      sortQuery = { price: -1 }; // Sort by price in descending order
    }

    if (rooms && rooms.length > 0) {
      const roomIds = rooms.map((room) => room);
      console.log("wskk", roomIds);
      const sortedRooms = await Rooms.find({ _id: { $in: roomIds } }).sort(
        sortQuery
      );
      res.json(sortedRooms);
      // console.log("jjjjisjkk",sortedRooms)
    } else {
      // If no rooms array is sent, sort all rooms
      const sortedRoomss = await Rooms.find({}).sort(sortQuery);
      res.json(sortedRoomss);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const postFilter = async (req, res) => {
  const { categories, amenities, roomID } = req.body;
  console.log("Received request with roomID:", roomID, amenities, categories);

  try {
    // Find room by ID or fetch all rooms if roomID is an array
    let rooms;
    if (Array.isArray(roomID)) {
      rooms = await Rooms.find({ _id: { $in: roomID } });
    } else {
      const room = await Rooms.findById(roomID);
      rooms = room ? [room] : [];
    }

    console.log("Retrieved rooms from the database:", rooms);

    // Apply filters based on categories and amenities if provided
    let filteredRooms = rooms;

    if (categories && categories.length > 0) {
      // Filter rooms based on categories
      filteredRooms = filteredRooms.filter((room) =>
        categories.includes(room.category)
      );
    }

    if (amenities && amenities.length > 0) {
     
      filteredRooms = filteredRooms.filter((room) =>
        room.amenities.some((amenity) => amenities.includes(amenity))
      );
    }

    console.log("Filtered rooms:", filteredRooms);

    // Send the filtered rooms as response
    res.json(filteredRooms);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const bookingGetpage = async (req, res) => {
  try {
    // Retrieve data from the query parameters
    const { room_id, checkInDate, checkOutDate, price } = req.query;
    // console.log(req.query)
    // console.log("Room ID:", room_id);
    // console.log("Check-in Date:", checkInDate);
    // console.log("Check-out Date:", checkOutDate);
    // console.log("Price:", price);

   
    if (req.cookies.user_jwt) {
     
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      const userId = decodedToken.id;

      // Fetch user details from the database using user ID
      const user = await User.findById(userId);

      // Fetch room details from the database using room ID
      const room = await Rooms.findById(room_id);

      // Render the booking page with the received data
      res.render("user/booking", {
        user,
        room,
        checkInDate,
        checkOutDate,
        price,
      });
    } else {
      // If user is not authenticated, send an unauthorized response

      res.render("user/login");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const Postbooking = async (req, res) => {
  const {
    userName,
    email,
    roomName,
    category,
    checkInDate,
    checkOutDate,
    price,
    roomid,
    orderId,
    paymentId,
  } = req.body;
  console.log(price);
  if (!checkInDate || !checkOutDate) {
   
    return;
  }

  
  const formattedCheckInDate = new Date(checkInDate)
    .toISOString()
    .split("T")[0];
  const formattedCheckOutDate = new Date(checkOutDate)
    .toISOString()
    .split("T")[0];

  try {
    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update user's booking details with the extracted date portions
    user.booking.push({
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      price,
      room: { roomid },
      orderId,
      paymentId,
    });

    // Save the updated user document
    await user.save();


      

    // Send email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Update with your email service
      auth: {
        user: "shihas732@gmail.com", 
        pass: "lkox ydmj nigs qnlb", 
      },
    });

    const mailOptions = {
      from: "your_email@gmail.com",
      to: user.email,
      subject: "Booking Confirmation",
      text: `Hello ${user.userName},\n\nYour booking details:\nRoom: ${roomName}\nCheck-in Date: ${formattedCheckInDate}\nCheck-out Date: ${formattedCheckOutDate}\nPrice: ${price}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send email");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).redirect("/booking?success=true");
        
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const  apigetuser = async (req, res) => {
  const roomId = req.query.roomId; // Use req.query.roomId to access query parameters
  console.log("Room ID:", roomId); // Log the room ID for debugging

  try {
    const bookings = await User.find(
      { "booking.room.roomid": roomId },
      "booking.checkInDate booking.checkOutDate booking.staus"
    );
    console.log("asdfghj", bookings);
    const dateRanges = bookings.flatMap(user => {
      return user.booking
        .filter(booking => booking.staus !== "cancel")
        .map(booking => {
          // Validate the booking dates
          if (!booking || !booking.checkInDate || !booking.checkOutDate) {
            console.error("Invalid date format in database");
            return {
              checkInDate: "Invalid Date",
              checkOutDate: "Invalid Date",
            };
          }

        return {
          checkInDate: new Date(booking.checkInDate)
            .toISOString()
            .split("T")[0],
          checkOutDate: new Date(booking.checkOutDate)
            .toISOString()
            .split("T")[0],
        };
      });
    });
    console.log("Date Ranges:", dateRanges); 

    res.json(dateRanges); // Send date ranges to the frontend
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getwhislist = async (req, res) => {
  if (req.cookies.user_jwt) {
    try {
     
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
     
      const userId = decodedToken.id;
   

      const userDeatails = await User.findById(userId);
      //  console.log("asdf",userDeatails)
      
      const user = await User.findById(userId).populate("whishlist.roomId");
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
        // res.redirect("/user/login")
      }

      
      const wishlist = user.whishlist;

     
      const roomDetails = [];

      // Fetch room details for each room ID in the wishlist
      for (const item of wishlist) {
        const room = await Rooms.findById(item.roomId);
        if (room) {
          roomDetails.push(room);
        }
      }
      //  console.log("werty",roomDetails);
      // Pass wishlist data and room details to the rendering engine
      res.render("user/wislist", { wishlist, roomDetails, userDeatails });
    } catch (error) {
      // Handle any errors that occur during token decoding or database operations
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Handle case when JWT token is not present in cookies
    console.log("JWT token not found in cookies");
     return res.status(401).json({ error: "JWT token not found in cookies" });
    // res.redirect("/login")
  }
};

const postwishlist = async (req, res) => {
  const roomId = req.body.roomId; // Accessing roomId from req.body
  console.log("Room ID:", roomId);

  if (req.cookies.user_jwt) {
    try {
      // Decode the JWT token to extract the user ID
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      console.log("Decoded Token:", decodedToken);
      const userId = decodedToken.id;
      console.log("User ID:", userId);

      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
      }

      const roomIndex = user.whishlist.findIndex(
        (item) => item.roomId.toString() === roomId
      );

      if (roomIndex !== -1) {
        // If room already exists in the wishlist, remove it
        user.whishlist.splice(roomIndex, 1);
        await user.save();
        return res.status(200).json({ message: "Room removed from wishlist" });
      }

      // If room does not exist in the wishlist, add it
      user.whishlist.push({ roomId });
      await user.save();

      // Send a success response
      return res.status(200).json({ message: "Room added to wishlist" });
    } catch (error) {
      // Handle any errors that occur during token decoding or database operations
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Handle case when JWT token is not present in cookies
    console.log("JWT token not found in cookies");
    return res.status(401).json({ error: "JWT token not found in cookies" });
  }
};



const couponapply = async (req, res) => {
  try {
    const { couponCode } = req.body;
    console.log(couponCode);

    // Find the admin document in the database
    const admin = await Admin.findOne();

    // console.log("admin",admin)
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Check if the coupon exists in the admin's coupons array
    const coupon = admin.coupon.find((c) => c.couponCode === couponCode);
    console.log("coupon", coupon);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // If the coupon exists, retrieve its details
    const couponDetails = {
      couponCode: coupon.couponCode,
      discountAmount: coupon.discountAmount,
      validity: coupon.validity,
      couponStatus: coupon.couponStatus,
      couponType: coupon.couponType,
      startDate: coupon.startDate,
    };

    // Send the coupon details to the frontend
    res.status(200).json(couponDetails);
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const orders = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: 50000,
      currency: "INR",
      receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

let razorpayment = async (req, res) => {
  const { total } = req.body;
  const totalPrice = parseFloat(total);
  console.log("SKNF;SKDFEWFKFMSD;KLFJDK  :", totalPrice);
  try {
    const options = {
      amount: totalPrice * 100,
      currency: "INR",
      receipt: "orderId",
    };

    razorpay.orders.create(options, function (err, booking) {
      if (err) {
        console.log("kshhfsf :", err);
        res.status(400).json({ error: err.message });
      } else {
        res.status(200).json({
          orderId: booking.id,
          key_id: process.env.RAZORPAY_KEY_ID,
          totalPrice,
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const getbookindetails = async (req, res) => {
  try {
    if (req.cookies.user_jwt) {
      const decodedToken = jwt.verify(
        req.cookies.user_jwt,
        process.env.JWT_SECRET
      );
      const userId = decodedToken.id;

      console.log(userId);
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }


      // Use aggregation to fetch booking details with room information
      const bookingss = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // Match user by ID
        { $unwind: { path: "$booking" } },
        { $unwind: { path: "$booking.room" } },
        {
          $lookup: {
            from: "rooms",
            let: {
              roomid: {
                $toObjectId: "$booking.room.roomid",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$roomid"] },
                },
              },
            ],
            as: "booking.roomDetails",
          },
        },
      ]);

      
      bookingss.forEach((booking) => {
        if (booking.booking.checkInDate) {
          booking.booking.checkInDateFormatted = new Date(booking.booking.checkInDate).toLocaleDateString("en-GB");
        }
        if (booking.booking.checkOutDate) {
          booking.booking.checkOutDateFormatted = new Date(booking.booking.checkOutDate).toLocaleDateString("en-GB");
        }
        if (booking.createdAt) {
          booking.createdAtFormatted = new Date(booking.createdAt).toLocaleDateString("en-GB");
        }
      });
  
      bookingss.reverse();
  
      console.log("checking booking  : ", bookingss);

      res.status(200).render("user/bookingdetails",{bookingss, user})
    }
  } catch (err) {
    // Handle JWT verification errors or database errors
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};



const postcancel = async (req, res) => {
  try {
      const bookingId = req.body.bookingId;
      console.log("Booking ID:", bookingId);

      // Verify JWT Token
      if (req.cookies.user_jwt) {
          const decodedToken = jwt.verify(req.cookies.user_jwt, process.env.JWT_SECRET);
          const userId = decodedToken.id;

          console.log("User ID:", userId);

          // Find user
          const user = await User.findById(userId);

          if (!user) {
              throw new Error("User not found");
          }

          // Find order by bookingId and update its status to 'cancel'
          const booking = user.booking.find(booking => booking._id.toString() === bookingId);
          console.log("shiiihhhshshs",booking)
          if (!booking) {
              throw new Error("Order not found");
          }
         
          
          booking.staus = "cancel"

        //  if( booking.staus = "cancel"){
        //            booking.checkInDate = null;
        //   booking.checkOutDate = null;
        //  }

         

          // Save updated user document
          await user.save();

          // Send response
          res.redirect("/bookingdetails");
      } else {
          throw new Error("JWT token not found in cookies");
      }
  } catch (error) {
      console.error("Error in cancel booking:", error);
      res.status(500).send("Internal Server Error");
  }
};

const postUpdateProfile = async (req, res) => {
  const { id, name, email, contact } = req.body;
  console.log("ggggg",id, name, email, contact);

  try {
      const user = await User.findById(id);
      console.log("user", user);

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      
      user.userName = name;
      user.email = email; 
      user.phoneNumber = contact;

      // Save the updated user
      await user.save();

    

      res.status(200).json({ message: "Success" });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};


const postreviews = async (req, res) => {
  try {
      const { roomId, rating, comment } = req.body;
      const userId = req.userId;

      // Check if all required fields are present
      if (!roomId || !rating || !comment) {
          return res.status(400).json({ error: 'Room ID, rating, and comment are required.' });
      }
      

      const room = await Rooms.findById(roomId);

      if (!room) {
          return res.status(404).json({ error: 'Room not found.' });
      }

      
      const existingReview = room.review.find(review => review.user.toString() === userId);
      if (existingReview) {
          
          existingReview.rating = rating;
          existingReview.comment = comment;
      } else {
          
          const newReview = {
              user: userId,
              rating,
              comment,
              createdAt: new Date()
          };
          room.review.push(newReview);
      }

      const totalRatings = room.review.reduce((total, review) => total + review.rating, 0);
      const ratingCount = room.review.length;
      const newRatingAvg = totalRatings / ratingCount;

      // Round the rating to the nearest 0.5 increment
      function roundToHalf(value) {
          return Math.round(value * 2) / 2;
      }

      room.ratingavg = roundToHalf(newRatingAvg);

      await room.save();

      res.status(201).json({ message: 'Review submitted successfully.' });
  } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'An error occurred while submitting your review. Please try again later.' });
  }
}



module.exports = {
  homePage,
  signup,
  signupPage,
  getLoginpage,
  login,
  userLogout,
  profile,
  getroompage,
  googleLogin,
  failureGoogleLogin,
  loginGetOtpPage,
  postEmail,
  postOtpVerify,
  getsingleroom,
  getRoomSearch,
  postPrice,
  getOtpPage,
  postroomsort,
  postFilter,

  bookingGetpage,
  Postbooking,
  apigetuser,
  getwhislist,
  postwishlist,
  couponapply,
  razorpayment,
  getbookindetails,
  postcancel,
  postUpdateProfile,
  postreviews
};
