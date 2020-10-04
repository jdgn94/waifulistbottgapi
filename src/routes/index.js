const express = require('express');
const router = express.Router();
const baseURL = 'api';

router.get('/', (req, res) => {
  res.send('hola vale');
});

module.exports = router;