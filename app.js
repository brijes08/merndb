const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const path = require('path');
const app = express();


dotenv.config({ path: "./config.env" })
require("./DB/connection")


if (mongoose.connection.readyState === 0) {
    mongoose.connect('mongodb+srv://brijes08:X5OJqrp6Vzu4H3hm@cluster0.m1ht25f.mongodb.net/mernstack', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
// Create a mongoose model for your images
const Image = mongoose.model('Image', {
  filename: String, // Assuming your images have a filename field in the database
  data: Buffer,     // Assuming your images are stored as Buffer data in the database
});




app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ credentials: true, origin: "https://brijes.vercel.app" }))

app.use(require("./router/auth"))

app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
next();
});

app.get('/images/:filename', async (req, res) => {
    try {
      const filename = req.params.filename;
  
      // Find the image in the database by filename
      const image = await Image.findOne({ filename });
  
      if (!image) {
        return res.status(404).send('Image not found');
      }
  
      // Set the appropriate content type
      res.contentType('image/png'); // Adjust content type based on your image format
  
      // Send the image data
      res.send(image.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

 
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server is running at port no. ${PORT}`)
})