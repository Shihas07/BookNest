const Vendor = require("../model/vendor/vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin/admin");
const Room = require("../model/room");
const cloudinary = require("../config/cloudinary");
// const upload = require("../config/multer"); // Import Multer configuration
// const bodyParser = require("body-parser")

require("dotenv").config();

const index = async (req, res) => {
  try {
    if (req.cookies.vendor_jwt) {
      const decodedToken = jwt.verify(
        req.cookies.vendor_jwt,
        process.env.JWT_SECRET
      );
      console.log(decodedToken);
      const vendorId = decodedToken.id;
      console.log(vendorId);
      const vendor = await Vendor.findById(vendorId);

      res.render("vendor/index", { vendor });
    }

    //   console.log(vendor);
    // res.render('vendor/index',{vendor});
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
    const rooms = await Room.find();
    console.log(rooms);
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
  console.log("req.files:", req.files);
  const roomImages = req.files; // Assuming this is an array of files
  const roomData = req.body;
  console.log(roomImages);
  console.log(roomData);

  try {
    // Destructure directly from req.body for clarity and simplicity
    const { roomName, description, category, location, price } = roomData;
    const imageUrls = [];

    // Ensure you have logic here to handle when `req.files` is undefined or empty
    for (const file of roomImages) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
      console.log("image link", imageUrls);
    }

    // Correct the property names according to your schema
    const newRoom = new Room({
      roomName, // corrected from RoomName
      price, // corrected from productPrice
      description,
      category,
      location,
      roomImages: imageUrls,
    });

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
    const { roomName, description, category, location, price, roomId } = roomData;
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
};
