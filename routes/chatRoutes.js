const express = require("express");
const router = express.Router();
const {chatWithJimmy} = require("../controllers/chatController");


router.post("/chat",chatWithJimmy);

module.exports = router;
