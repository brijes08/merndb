const express = require("express")
const bcrypt = require("bcryptjs")
const multer = require('multer')
const authenticate = require("../middleware/authenticate")
const router = express.Router()
const cookie = require('cookie');

require("jsonwebtoken")
require("../DB/connection")
const User = require("../models/userSchema")


router.get("/", (req, res) => {
    res.send("this is my home page")
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '_' + file.originalname);
    },
});
const upload = multer({ storage: storage });


router.post("/register", upload.single('file'),  async (req, res) => {

    const { name, email, phone, work, images, password, cpassword } = req.body;
    if (!name || !email || !phone || !images || !work || !password || !cpassword) {
        res.status(400).json({ error: "Plese Fill The Fields Properly" })
    }

    try {
        const emailData = await User.findOne({ email: email })
        const numberData = await User.findOne({ phone: phone })
        if (emailData || numberData) {
            res.status(400).json({ error: "Your Entered Details is in our record!!!" })
        } else if (password !== cpassword) {
            res.status(400).json({ error: "Password and Confirm Password are Not Same!!!" })
        } else {
            const user = new User({ name, email, phone, work, images: 'https://portfoliodb-wj77.onrender.com' + '/images/' + req.file.filename, password, cpassword })
            try {
                await user.save();
                res.status(200).json({ message: "User Registered Successfully" });
              } catch (error) {
                console.error("Error saving user:", error);
                res.status(500).json({ message: "Internal Server Error" });
              }
        }

    } catch (err) {

        console.log('Registration Faild From Auth')

    }
})

router.post("/signin", async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Plese Fill The Fields Properly" })
    }

    try {

        const userEmail = await User.findOne({ email: email })
        if (userEmail) {
            const passCheck = await bcrypt.compare(password, userEmail.password)

            const token = await userEmail.generateAuthToken()
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 86400000),  //24Hour k bad apne aap Log Out ho jayega (86400000 Milliseconds, 86400 Second, 1440 Minut, 24 Hours)
                httpOnly: true
            })

            if (passCheck) {
                res.status(200).json({ message: "You are Loged in Successfully!!!", token:token })
            } else {
                res.status(400).json({ error: "Invalid Email and Password!!!" })
            }
        } else {
            res.status(400).json({ error: "Invalid Email and Password!!!" })
        }

    } catch (err) {
        console.log('Login Faild')
    }
})

router.post('/update', upload.single('image'), async (req, res) => {
    const { _id, name, email, phone, work } = req.body;
    const student_img = req.file ? '/images/' + req.file.filename : undefined;
  
    if (!_id || !name || !email || !phone || !work) {
      return res.status(400).json({ error: 'Please Fill The Fields Properly' });
    }
  
    try {
      const userData = await User.findOne({ _id: _id });
  
      if (userData) {
        const updateFields = {
          name: name,
          email: email,
          phone: phone,
          work: work,
        };
  
        if (student_img) {
          updateFields.images = 'https://portfoliodb-wj77.onrender.com' + student_img;
        }
  
        const result = await User.updateOne({ _id: _id }, { $set: updateFields });
  
        if (result.matchedCount === 1) {
          return res.status(200).json({ message: 'User Updated Successfully' });
        } else {
          return res.status(404).json({ message: 'User not found' });
        }
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

router.post("/delete", async (req, res) => {
    const { _id } = req.body;
    try {
        const deletedData = await User.findByIdAndDelete(_id);

    if (!deletedData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully', deletedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.get("/about", authenticate,(req, res) => {
    console.log('About Us Page From Server')
    res.send(req.rootUser)
})

router.get("/getdata", authenticate, (req, res) => {
    console.log('Contact Us Page From Server')
    res.send(req.rootUser)
})

router.post("/contact", authenticate, async (req, res) => {
   const {name, email, phone, subject, message} = req.body;
   if (!name || !email || !phone || !subject || !message) {
    alert('Plese Fill The Fields Properly')
    res.status(400).json({ error: "Plese Fill The Fields Properly" })
   }

   const userContact = await User.findOne({_id: req.userID})

   if (userContact) {
    const userMessage = await userContact.addMessage(name, email, phone, subject, message)
    await userContact.save()
    res.status(200).json({message: "Message Sent Successfully"})
   }
})

router.get("/logout", (req, res) => {
    console.log('Logout Page From Server')
    res.clearCookie("jwtoken", {path: "/"})
    res.send("Logout")
})

module.exports = router