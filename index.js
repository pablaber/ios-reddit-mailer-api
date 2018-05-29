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
  else if(!req.query.email) {
    res.status(400).send("No 'email' parameter specified.");
  }
  else {
    var subreddit = req.query.subreddit;
    var limit = parseInt(req.query.limit);
    var email = req.query.email;
    if(!limit) {
      res.status(400).send("Invalid 'limit' parameter. Must be a number.")
    }
    else if(!validateEmail(email)) {
      res.status(400).send("Invalid 'email' parameter. Must be a valid email.")
    }
    EmailComposer.composeEmail(subreddit, limit, email).then(function(response) {
      console.log(response);
      res.send(response);
    });
  }
});

app.listen(process.env.PORT, () => console.log('Example app listening on port ' + process.env.PORT + '!'));

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
