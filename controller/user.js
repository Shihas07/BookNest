const User = require("../model/user/user");
const Rooms = require("../model/room");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpService = require("../services/otp");

const cookieparser = require("cookie-parser");

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
      res.render("user/index", { user });
    } else {
      // Render home page without user message
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
  //extract data from body
  const { userName, email, password, phoneNumber } = req.body;
  //data excit
  if (!(userName, email, password, phoneNumber)) {
    res.status(400).send("if the data doesent excit");
  }
  //data alredy excit

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

  //jwt token

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

const getLoginpage=async(res,req)=>{
    
   res.render("user/login")
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
      // return res.status(400).redirect('/login?emailError=Invalid password or email');
      return res.status(400).send("invalid");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id, // Include user ID in the token payload
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set JWT token in a cookie
    res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 });

    console.log("User logged in successfully, token created");
    // Redirect the user to the home page
    res.redirect("/");
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
      res.cookie("otp", otp, { maxAge: 900000 }); // Cookie expires in 15 minutes (900000 milliseconds)

      return res.status(200).render("user/otpverify", { email });
    }

    // If the email doesn't exist, return an error
    return res.status(400).render("user/emailotp", { errorp: "Email does not exist" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const getOtpPage=async(req,res)=>{

    res.render("user/otpverify")
}

const postOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("kjsksk",email, otp);

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
  const decodedToken = jwt.verify(req.cookies.user_jwt, process.env.JWT_SECRET);
  const userId = decodedToken.id;
  const user = await User.findById(userId);

  res.render("user/profile", { user });
};

const getroompage = async (req, res) => {
  let rooms = await Rooms.find();
  console.log("rooms :", rooms);
  res.render("user/room-grid-style", { rooms });
};

const getsingleroom = async (req, res) => {
  const id = req.query.id;
  // console.log(req.query);

  // console.log(id);

  const room = await Rooms.findById(id);
  // console.log("vasu",room);

  res.render("user/singleroom", { room });
};

let getRoomSearch = async (req, res) => {
  const location = req.query.location;
  // console.log(location);

  const room = await Rooms.find({ location });
  // console.log(",ms,m,s", room);

  res.render("user/room-search", { room });
};

const postPrice = (req, res) => {
  console.log("edbjbdwljdjadjewh");
  const { checkOutDate } = req.body;
  console.log("Received Check-Out Date:", checkOutDate);
  // console.log("Received request body:", req.body);
  const roomPrice = 5000; // Room price per night
  const totalPrice = roomPrice;

  res.send(totalPrice.toString());
};

// const postroomsort=async(req,res)=>{
//   try {
//     const { sortBy,id } = req.query
//        console.log(req.query)
//     let sortQuery = {};

//     if (sortBy === "low-to-high") {
//       sortQuery = { price: 1 }; // Sort by price in ascending order
//     } else if (sortBy === "high-to-low") {
//       sortQuery = { price: -1 }; // Sort by price in descending order
//     }

//     const sortedRooms = await Rooms.find({}).sort(sortQuery);
//     res.json(sortedRooms);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }

// };

const postroomsort = async (req, res) => {
  try {
    
    const { rooms,sortBy } = req.body;
    // console.log(req.body)

    let sortQuery = {};

    if (sortBy === "low-to-high") {
      sortQuery = { price: 1 }; // Sort by price in ascending order
    } else if (sortBy === "high-to-low") {
      sortQuery = { price: -1 }; // Sort by price in descending order
    }

    if (rooms && rooms.length > 0) {
      const roomIds = rooms.map(room => room);
      console.log("wskk",roomIds);
      const sortedRooms = await Rooms.find({ _id: { $in: roomIds } }).sort(sortQuery);
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
      filteredRooms = filteredRooms.filter(room => categories.includes(room.category));
    }

    if (amenities && amenities.length > 0) {
      // Filter rooms based on amenities
      // Remove 'let' keyword here to avoid redeclaration
      filteredRooms = filteredRooms.filter(room => room.amenities.some(amenity => amenities.includes(amenity)));
    }

    console.log("Filtered rooms:", filteredRooms);

    // Send the filtered rooms as response
    res.json(filteredRooms);

  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};const bookingGetpage = async (req, res) => {
  try {
    // Retrieve data from the query parameters
    const { room_id,  checkInDate,  checkOutDate, price } = req.query;
    console.log(req.query)
    console.log("Room ID:", room_id);
    console.log("Check-in Date:", checkInDate);
    console.log("Check-out Date:", checkOutDate);
    console.log("Price:", price);

    // Check if the user is authenticated
    if (req.cookies.user_jwt) {
      // Decode JWT token to get user ID
      const decodedToken = jwt.verify(req.cookies.user_jwt, process.env.JWT_SECRET);
      const userId = decodedToken.id;

      // Fetch user details from the database using user ID
      const user = await User.findById(userId);

      // Fetch room details from the database using room ID
      const room = await Rooms.findById(room_id);

      // Render the booking page with the received data
      res.render("user/booking", { user, room, checkInDate, checkOutDate, price });
    } else {
      // If user is not authenticated, send an unauthorized response

      res.render("user/login")
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};





   

    


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
    // bookingPostpage,
    bookingGetpage

   

};
