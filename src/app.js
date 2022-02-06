"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = __importDefault(require("uuid"));
// import waifus from './routes/waifus';
// import franchises from './routes/franchise';
// import waifuTypes from './routes/waifu_type';
// import chats from './routes/chats';
// import waifuLists from './routes/waifu_list';
// import user from './routes/user';
// import specialImage from './routes/special_image';
// import bets from './routes/bets';
// initialization
const baseURL = '/api';
const app = (0, express_1.default)();
// settings
app.set('port', process.env.PORT || 3000);
// middelwares
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        console.log(file.path);
        cb(null, uuid_1.default.v4() + path_1.default.extname(file.originalname));
    }
});
app.use((0, multer_1.default)({ storage }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'fav_img', maxCount: 1 }
]));
// routes
// app.use(baseURL + '/waifus', waifus);
// app.use(baseURL + '/franchises', franchises);
// app.use(baseURL + '/waifu_types', waifuTypes);
// app.use(baseURL + '/chats', chats);
// app.use(baseURL + '/waifu_list', waifuLists);
// app.use(baseURL + '/user', user);
// app.use(baseURL + '/special_image', specialImage);
// app.use(baseURL + '/bets', bets);
exports.default = app;
