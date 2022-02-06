import express, { Request } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer, { FileFilterCallback, Multer } from 'multer';
import path from 'path';
import uuid from 'uuid';

import waifus from './routes/waifus';
import franchises from './routes/franchise';
import waifuTypes from './routes/waifu_type';
import chats from './routes/chats';
import waifuLists from './routes/waifu_list';
import user from './routes/user';
import specialImage from './routes/special_image';
import bets from './routes/bets';

// initialization
const baseURL = '/api';
const app = express();

// functions
const fileFilter = async (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(Error('Error: Solo imagenes!'));
  }
}

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
const limits = {
  storage,
  limits: {
    fieldNameSize: 100,
    fieldSize: 1500000000,
  },
  fileFilter
};
app.use(multer(limits).fields([
  { name: 'image', maxCount: 1 },
  { name: 'fav_img', maxCount: 1 },
  { name: 'summer_img', maxCount: 1 },
  { name: 'winter_img', maxCount: 1 },
  { name: 'spring_img', maxCount: 1 },
  { name: 'fall_img', maxCount: 1 }
]));

// routes
app.use(baseURL + '/waifus', waifus);
app.use(baseURL + '/franchises', franchises);
app.use(baseURL + '/waifu_types', waifuTypes);
app.use(baseURL + '/chats', chats);
app.use(baseURL + '/waifu_list', waifuLists);
app.use(baseURL + '/user', user);
app.use(baseURL + '/special_image', specialImage);
app.use(baseURL + '/bets', bets);

export default app;