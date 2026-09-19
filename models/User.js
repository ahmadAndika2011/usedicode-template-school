const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        rquired: true
    },
    password: {
        type: String,
        required:true
    },
    id_siswa: {
        type: mongoose.Schema.Types.ObjectId
    },
})