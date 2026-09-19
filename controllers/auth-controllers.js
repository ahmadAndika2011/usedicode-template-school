const {OAuth2Client} = require("google-auth-library")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
