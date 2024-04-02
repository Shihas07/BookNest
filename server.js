



const express = require("express");
const app = express();
const hbs = require("hbs");
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");
const vendorRouter = require("./router/vendor");

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const port = 7000;

// Set up view engine and static files
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount user and admin routers directly onto the main app
app.use("/", userRouter); // User routes will be handled at '/'
app.use("/", adminRouter);
app.use("/", vendorRouter);
 // Admin routes will be handled at '/admin'

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

   
