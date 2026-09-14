require("dotenv").config();
const express = require("express");
const app = express();

const methodOverride = require("method-override")
const path = require("path")
const connectDB = require("./config/db")
connectDB()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")
app.set("views", "./views")

app.use("/", require("./routes/home"))

app.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log("run at http://localhost:3000")
});
