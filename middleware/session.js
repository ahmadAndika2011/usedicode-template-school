const session = require("express-session")
const {MongoStore} = require("connect-mongo")

const sessionMiddleware = session({
    name: "school_session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions"
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 1,
    }
})

module.exports = sessionMiddleware