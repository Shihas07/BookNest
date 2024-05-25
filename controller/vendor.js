const Vendor = require("../model/vendor/vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin/admin");
const Room = require("../model/room");
const cloudinary = require("../config/cloudinary");
const User=require("../model/user/user")
// const upload = require("../config/multer"); // Import Multer configuration
// const bodyParser = require("body-parser")

require("dotenv").config();

// const index = async (req, res) => {
//   try {
//     if (req.cookies.vendor_jwt) {
//       const decodedToken = jwt.verify(
//         req.cookies.vendor_jwt,
//         process.env.JWT_SECRET
//       );
//       console.log(decodedToken);
//       const vendorId = decodedToken.id;
//       console.log(vendorId);
//       const vendor = await Vendor.findById(vendorId);
//           const user=await User.find()
//        const booking= user.booking
//      console.log("ttt",booking)

        

//       res.render("vendor/index", { vendor });
//     }

//     //   console.log(vendor);
//     // res.render('vendor/index',{vendor});
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };


const index = async (req, res) => {
  try {
    if (req.cookies.vendor_jwt) {
      const decodedToken = jwt.verify(req.cookies.vendor_jwt, process.env.JWT_SECRET);
      const vendorId = decodedToken.id;
      
      // Retrieve vendor information
      const vendor = await Vendor.findById(vendorId);
      
      const bookingCounts = await User.aggregate([
        { $unwind: '$booking' },
        { $group: { _id: '$booking.room.roomid', count: { $sum: 1 } } }
    ]);
    
    // Retrieve the IDs of rooms with bookings
    const roomIdsWithBookings = bookingCounts.map(booking => booking._id);
    
    const rooms = await Room.find({ 
      _id: { $in: roomIdsWithBookings }, 
      vendor: vendorId // Only retrieve rooms owned by the same vendor
  });

    const roomData = rooms.map(room => {
      // Find the corresponding booking count for the room
      const bookingCount = bookingCounts.find(booking => booking._id.toString() === room._id.toString());
      // If booking count is found, return the count, otherwise return 0
      const totalBookings = bookingCount ? bookingCount.count : 0;
      return { roomName: room.roomName, bookingCount: totalBookings };
  });

  const roomDataFormatted = roomData.reduce((acc, { roomName, bookingCount }) => {
    acc[roomName] = bookingCount;
    return acc;
  }, {});

  const totalBookings = bookingCounts.reduce((total, booking) => total + booking.count, 0);
  
  console.log("Room Data:",totalBookings,roomData );


  const vendorRooms = await Room.find({ vendor: vendorId });

  // Step 2: Extract Room IDs
  const roomIds = vendorRooms.map(room => room._id);

  const bookedUser = await User.find({ 'booking.room.roomid': { $in: roomIds } });
   console.log("fff",bookedUser);


 
  let totalPrice = []
  
 

       
  bookedUser.forEach(user => {
      
      user.booking.forEach(booking => {
         
        totalPrice.push(booking.price);
      });
  });

  let total=totalPrice.reduce((a,b)=>a+b,0)
  
  const bookedUsers = await User.distinct('userName', { 'booking.room.roomid': { $in: roomIds } });

 
  const bookedUsersCount = bookedUsers.length;
  
  console.log("User Counts:", bookedUsersCount,total);


     //chart monthly booking//
     const getMonthName = (monthNumber) => {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNames[monthNumber];
    };
    
    const bookingsByMonth = {};
    
    // Initialize counts for all months
    for (let i = 0; i < 12; i++) {
        const monthName = getMonthName(i);
        bookingsByMonth[monthName] = 0;
    }
    
    // Count bookings by month
    bookedUser.forEach(user => {
        user.booking.forEach(booking => {
            const bookingMonth = new Date(booking.checkInDate).getMonth(); // Get month (0-indexed)
            const monthName = getMonthName(bookingMonth);
            bookingsByMonth[monthName]++;
        });
    });
   
    const bookingsByMonthJSON = JSON.stringify(bookingsByMonth);
    console.log(bookingsByMonthJSON);

    

       ///roomname and count
    console.log(roomDataFormatted);
    const roomDataJson = JSON.stringify(roomDataFormatted);

      res.render("vendor/index", { vendor, totalBookings,bookedUsersCount,total,bookingsByMonthJSON,roomDataJson});
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const signupGetPage = async (req, res) => {
  res.render("vendor/register");
};

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

    const token = jwt.sign(
      {
        id: newvendor._id, // Corrected variable name
        name: newvendor.vendorName,
        email: newvendor.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    console.log(token);
    res.cookie("vendor_jwt", token, { httpOnly: true, maxAge: 86400000 });
    res.redirect("/vendor/index");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getlogin = async (req, res) => {
  res.render("vendor/login");
};

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
    if(vendor.blocked){
      return res
      .status(400)
      .render("vendor/login", { errorp: "blocked ! pleaase contact admin" });
    }

    const hashPassword = await bcrypt.compare(password, vendor.password);
    if (!hashPassword) {
      return res
        .status(400)
        .render("vendor/login", { errorp: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("vendor_jwt", token, { httpOnly: true, maxAge: 86400000 });
    console.log("Vendor logged in successfully, token created");
    res.redirect("/vendor/index");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const signout = async (req, res) => {
  res.clearCookie("vendor_jwt");
  console.log("logout successfully");
  res.redirect("/vendor/login");
};

const roomgetPage = async (req, res) => {
  try {
    // Fetch room data from the database
    const rooms = await Room.find({vendor:req.user.id});

    // console.log(rooms);
    // Render the template and pass the room data
    res.render("vendor/roomlist", { rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send("Internal Server Error");
  }
  // res.render("vendor/roomlist")
};
const getaddproduect = async (req, res) => {
 
  try {
    const adminData = await Admin.findOne();
    let Category = [];

    if (adminData && adminData.category) {
      Category = adminData.category;
    }

    // products.forEach(product => {
    //     Category = Admin.concat(product.category);
    // });
    // console.log(Category);

    res.render("vendor/add-product", { Category, error: " " });
  } catch (error) {
    console.log("Error fetching Category:", error);
    res.render("vendor/add-product", { error: "Error fetching Category" });
  }
};

const postaddroom = async (req, res) => {
  const  vendorId = req.user.id

  // console.log("req.files:", req.files);
  const roomImages = req.files; // Assuming this is an array of files
  const roomData = req.body;
  // console.log(roomImages);
  // console.log(roomData);
  console.log(req.body);


  try {
    // Destructure directly from req.body for clarity and simplicity
    const { roomName, description, category, location, price,bedtype,guest } = roomData;
    const imageUrls = [];


      //  console.log("hbhvhv",aminities,bedtype,);
    // Ensure you have logic here to handle when `req.files` is undefined or empty
    for (const file of roomImages) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
      // console.log("image link", imageUrls);
    }



    // Correct the property names according to your schema
    const newRoom = new Room({
      roomName, // corrected from RoomName
      price, // corrected from productPrice
      description,
      category,
      location,
      roomImages: imageUrls,
      amenities:roomData.amenities,
      bedtype,
      guest,
      vendor: vendorId

    })

    await newRoom.save();

    res.redirect("/vendor/roomlist");
    console.log("Success: Room added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const getEditRoompage = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(req.params.id);
    console.log(id);

    // Assuming Room is your Mongoose model
    let edit = await Room.findOne({ _id: id });

    if (!edit) {
      // Handle case where room with the given id is not found
      return res.status(404).send("Room not found");
    }
    console.log(edit);

    // Render the edit room page with the room data
    res.render("vendor/addroomedit", { edit });
  } catch (error) {
    // Handle any errors that occur during the database query or rendering
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const postEditRoompage = async (req, res) => {
 
const roomData = req.body;
  const roomImages = req.files; // Assuming this is an array of files
  //    console.log(roomImages);
  //    console.log(roomData);
  //    console.log(id);
  try {
    // Destructure directly from req.body for clarity and simplicity
    const { roomName, description, category, location, price, roomId,bedtype,guest} = roomData;
    console.log(roomData)
    const imageUrls = [];
    

    // Check if new images are uploaded and upload them to Cloudinary
    if (roomImages && roomImages.length > 0) {
      for (const file of roomImages) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
    }

    // Find the room by id
    const room = await Room.findById(roomId);
    // console.log( "ksj",room);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Update room data
    room.roomName = roomName;
    room.price = price;
    room.description = description;
    room.category = category;
    room.location = location;
    room.amenities=roomData.amenities;
    room.bedtype=bedtype;
    room.guest=guest;

    // Update roomImages if new images are uploaded
    if (imageUrls.length > 0) {
      room.roomImages = imageUrls;
    }

    await room.save();

    res.redirect("/vendor/roomlist");
    console.log("Success: Room edited");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

let deleteRoom = async (req, res) => {
  const id = req.params.id;

  try {
      
      const room = await Room.findById(id);

      if (!room) {
          return res.status(404).json({ error: 'Room not found' });
      }

      
      await room.deleteOne();

      res.status(200).redirect("/vendor/roomlist")
      console.log(delete succes);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};
const getbooking = async (req, res) => {
  try {
   
    const usersWithBookings = await User.find({}, 'userName email booking');

   
    const bookingDetails = [];

    
    for (const user of usersWithBookings) {
        for (const booking of user.booking) {
         
            const room = await Room.findById(booking.room[0].roomid);
            
            bookingDetails.push({
                userName: user.userName,
                email: user.email,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                price: booking.price,
                status: booking.staus,
                bookingid: booking._id,
                userid:user._id,
                roomDetails: room 
            });
        }
    }

    // console.log(bookingDetails)

  
    res.render("vendor/booking", { bookingDetails });
} catch (error) {
    console.error("Error fetching booking details:", error);
   
    res.status(500).send("Internal Server Error");
}
};
  
const postcancel = async (req, res) => {
  try {
      const { bookingid, userid } = req.body;

     console.log(req.body)
      const user = await User.findById(userid);

     
      const booking = user.booking.find(booking => booking._id.toString() === bookingid);

      if (!booking) {
         
          return res.status(404).send("Booking not found");
      }

     
      booking.staus = "cancel";

      // Save the changes to the user
      await user.save();

      console.log(booking.staus);

      // Redirect user to the booking page
      res.status(200).json({message:"success"})

      // console.log(user);
  } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error cancelling booking:", error);
      res.status(500).send("Internal Server Error");
  }
};

const postcheckin=async(req,res)=>{
  try {
    const { bookingid, userid } = req.body;

   
    const user = await User.findById(userid);

   
    const booking = user.booking.find(booking => booking._id.toString() === bookingid);

    if (!booking) {
       
        return res.status(404).send("Booking not found");
    }

   
    booking.staus = "checkin";

    
    await user.save();

    console.log(booking.staus);

  
    res.status(200).json({message:"success"})

    
} catch (error) {
    
    console.error("Error cancelling booking:", error);
    res.status(500).send("Internal Server Error");
}
}
const postchekout=async(req,res)=>{
  try {
    const { bookingid, userid } = req.body;

   
    const user = await User.findById(userid);

   
    const booking = user.booking.find(booking => booking._id.toString() === bookingid);

    if (!booking) {
       
        return res.status(404).send("Booking not found");
    }

   
    booking.staus = "checkout";

    
    await user.save();

    console.log(booking.staus);

  
    res.status(200).json({message:"success"})

    
} catch (error) {
    
    console.error("Error cancelling booking:", error);
    res.status(500).send("Internal Server Error");
}
}




module.exports = {
  index,
  signupGetPage,
  signupPostPage,
  getlogin,
  postLogin,
  signout,
  roomgetPage,
  getaddproduect,
  postaddroom,
  getEditRoompage,
  postEditRoompage,
  deleteRoom,
  getbooking,
  postcancel,
  postcheckin,
  postchekout
};
