const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid')
const exphbs = require('express-handlebars');

const router = require('./routes');



// initialization
const app = express();
require('./database');

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}));
app.set('view engine', '.hbs');

// middelwares
app.use(morgan('dev'));
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
app.use(router);

module.exports = app;