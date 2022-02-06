if (process.env.NODE_ENV !== 'producction') require('dotenv').config();

import app from './app';
import db from './db/models';

db.sequelize.sync().then(() => {
  app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
  });
});