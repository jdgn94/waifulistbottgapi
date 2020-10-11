const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid')

const baseURL = '/api';
const waifus = require('./routes/waifus');
const franchises = require('./routes/franchise');
const waifuTypes = require('./routes/waifu_type');
const chats = require('./routes/chats');
const waifuLists = require('./routes/waifu_list');

// initialization
const app = express();

// settings
app.set('port', process.env.PORT || 3000);

// middelwares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
    console.log(file.path);
    cb(null, uuid.v4() + path.extname(file.originalname));
  }
});
app.use(multer({ storage }).single('image'))

// routes
app.use(baseURL + '/waifus', waifus);
app.use(baseURL + '/franchises', franchises);
app.use(baseURL + '/waifu_types', waifuTypes);
app.use(baseURL + '/chats', chats);
app.use(baseURL + '/waifu_list', waifuLists);

module.exports = app;