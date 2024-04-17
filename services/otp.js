
//  const nodemailer=require("nodemailer")

    

    
//  const transporter = nodemailer.createTransport({
//   service:"gmail",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user: "shihas732@gmail.com",
//     pass: "jn7jnAPss4f63QBp6D",
//   },
// });


// const mailOptions = {
//   from: 'shihas732@gmail.com',
//   to: email,
//   subject: 'Login OTP',
//   text:`Your OTP for login is:${otp}`
// };





// const sendMail=async(transporter,mailOptions)=>{
//     try {
//        await transporter.sendMail(mailOptions)
//        console.log("success pass");
//     } catch (error) {
//       console.log(error);
//     }

//   }
// sendMail(transporter,mailOptions);

// module.exports=otpService



   const nodemailer=require("nodemailer")

const otpService = {
  otpMap: new Map(),

  generateOTP: function () {
      return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  },

  sendOTP: async function (email, otp) {
      try {
          const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: 'shihas732@gmail.com', // Your Gmail email address
                  pass: 'lkox ydmj nigs qnlb' // Your Gmail password
              }
          });

          const mailOptions = {
              from: 'shihas732@gmail.com',
              to: email,
              subject: 'Login OTP',
              text:`Your OTP for login is:${otp}`
          };

          await transporter.sendMail(mailOptions);
          console.log('OTP sent successfully.');
      } catch (error) {
          console.error('Error sending OTP:', error);
          throw new Error('Error sending OTP. Please try again.');
      }
  },

  // verifyOTP: function (email, otp) {
  //     const storedOTP = this.otpMap.get(email);
  //     return storedOTP === otp;
  // }

 getStoredOTP: function (email, otp) {
    // Retrieve the stored OTP for the given email
    const storedOTP = this.otpMap.get(email);
    
    // Check if the stored OTP exists and matches the provided OTP
    if (storedOTP && storedOTP === otp) {
        return true; // OTP is valid
    } else {
        return false; // OTP is invalid
    }
}

};

module.exports=otpService