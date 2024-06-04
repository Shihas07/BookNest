



const express = require("express");
const app = express();
const hbs = require("hbs");
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");
const vendorRouter = require("./router/vendor");
const bodyParser=require('body-parser')
const session=require("express-session")
const passport=require("passport")
require('dotenv').config()
const passportSetup=require("./helpers/passport")
const Handlebars = require('handlebars');



const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const port = 7000;

// Set up view engine and static files
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});



app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.json()); // This line is important!

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Mount user and admin routers directly onto the main app
app.use("/", userRouter); // User routes will be handled at '/'
app.use("/", adminRouter);
app.use("/", vendorRouter);
 
mongoose.connect(process.env.mongoURI)
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

   
