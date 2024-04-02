const express = require("express");
const app = express();
const hbs = require("hbs");
const userRouter = require("./router/user");
const mongoose=require("mongoose") // Require your router file
const port = 7000;

app.set("view engine", "hbs");
app.set("views", __dirname + "/views/user"); // Set views directory correctly

hbs.registerPartials(__dirname + "/views/user/partials");
app.use(express.static("public"));


//database connection
const mongoURI = 'mongodb://localhost:27017/mydatabase';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })

.then(() => {
   console.log('Connected to MongoDB');
   // Now you can start your Express server or perform any other operations
})
.catch(error => {
   console.error('Error connecting to MongoDB:', error.message);
});

// Use the router for all routes starting from '/'
app.use('/', userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
