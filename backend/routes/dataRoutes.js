const express = require("express");
const { getData, createData } = require("../controllers/dataController");

const router = express.Router();

router.get("/", getData);
router.post("/", createData);

module.exports = router;