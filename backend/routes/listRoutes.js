const express = require('express');
const { createList, getLists } = require('../controllers/listController');
const router = express.Router();

router.post('/', createList);
router.get('/', getLists);

module.exports = router;
