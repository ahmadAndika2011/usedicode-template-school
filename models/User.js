const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required:true
    },
    id_siswa: {
        type: mongoose.Schema.Types.ObjectId
    },
})

module.exports = mongoose.model("User", userSchema)