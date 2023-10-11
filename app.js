const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express();


dotenv.config({ path: "./config.env" })
require("./DB/connection")

app.use(express.static("public"));
app.use(express.json())
app.use(cors({ credentials: true, origin: "http://localhost:3000" }))
app.use(cookieParser())
app.use(require("./router/auth"))

app.get("/", (req, res) => {
    res.send("this is my home page")
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server is running at port no. ${PORT}`)
})