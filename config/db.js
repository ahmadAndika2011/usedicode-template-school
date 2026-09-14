const mongoose = require("mongoose")

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("Success connect to mongoDB")
    }catch(err) {
        console.log("mongoDB error : ", err.message)
    }
}

module.exports = connectDB