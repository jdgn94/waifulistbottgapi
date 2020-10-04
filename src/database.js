const mongoose = require('mongoose');

const MONGODB_URI = `mongodb://${process.env.MONGODB_HOST || 'localhost'}/${process.env.MONGODB_DATABASE || 'waifu_list_bot_test'}`;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
.then((db) => console.log("Mongodb is connected to", db.connection.host))
.catch((err) => console.error(err));