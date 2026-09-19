require("dotenv").config();

const express = require("express");
const app = express();

const methodOverride = require("method-override")
const path = require("path")
const connectDB = require("./config/db")

const {
  generalLimiter,
  authLimiter,
  helmetMiddleware,
  sanitizeInput
} = require("./middleware/security")

connectDB()

// app.use(generalLimiter);
app.use(helmetMiddleware);
app.use(express.json({ limit: "10kb" })); // Pembatas payload DoS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(sanitizeInput);

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")
app.set("views", "./views")

//? authentication
// app.use("/", authLimiter, require("./routes/login"))
// app.use("/", authLimiter, require("./routes/signup"))

//? AI chat
app.use("/", require("./routes/ai-chat"))

app.use("/", require("./routes/home"))

app.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log("run at http://localhost:3000")
});
