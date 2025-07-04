const express = require('express');
const bodyParser = require('body-parser');
const slack = require('./slack');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/slack/events', slack.handleSlashCommand);

app.listen(3000, () => {
  console.log('ChatOps Bot running at http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('ChatOps Bot is running 🚀');
});

