if (process.env.NODE_ENV !== 'producction') require('dotenv').config();

const app = require('./app');

app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
})