const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const TaskRoutes = require('./Routes/Task');
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use('/task', TaskRoutes);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(2000, () => {
  console.log('Server is running on port http://localhost:2000!');
});

