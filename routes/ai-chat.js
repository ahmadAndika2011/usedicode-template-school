const express = require("express")
const router = express.Router()

const controllers = require("../controllers/ai-chat-controllers")

router.post("/api/chat", controllers.apiChat)

module.exports = router