const express = require('express');
const router = express.Router();
const {lookupByMBIDController} = require('../controllers/musicBrainzController');

router.get('/:type/:mbid', lookupByMBIDController);

module.exports = router;
