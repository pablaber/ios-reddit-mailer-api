const express = require('express');
const app = express();

require('dotenv').config();

const EmailComposer = require('./modules/redditEmailComposer');

app.get('/api/reddit', (req, res) => {
  if(!req.query) {
    res.status(400).send("No parameters specified.");
  }
  else if(!req.query.subreddit) {
    res.status(400).send("No 'subreddit' parameter specified.");
  }
  else if(!req.query.limit) {
    res.status(400).send("No 'limit' parameter specified.");
  }
  else {
    var subreddit = req.query.subreddit;
    var limit = parseInt(req.query.limit);
    if(!limit) {
      res.status(400).send("Invalid 'limit' parameter. Must be a number.")
    }
    EmailComposer.composeEmail(subreddit, limit).then(function(response) {
      res.send(response);
    });
  }
});

app.listen(process.env.PORT, () => console.log('Example app listening on port ' + process.env.PORT + '!'));
