var request = require('request');
var moment = require('moment');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var path = require('path');

var Tag = require('./htmlBuilder');


function composeEmail(subreddit, limit, email) {
  return new Promise(function(resolve, reject) {
    createPostObjects(subreddit, limit).then(function(postObject) {
        var html = generateHTML(postObject, subreddit);
        emailHTML(html, email, subreddit, resolve, reject);
    });
  });

}

function createPostObjects(subreddit, limit) {
    return new Promise(function(resolve, reject) {
      var url = apiUrl(subreddit, limit);
      request(url, function (error, response) {
        if(error) {
          reject(error);
        }
        var json = JSON.parse(response.body);
        var posts = json.data.children;
        var subredditPosts = [];
        for (let post of posts) {
          var postObj = {
            title: post.data.title,
            url: post.data.url,
            author: post.data.author,
            subreddit: post.data.subreddit,
            domain: post.data.domain,
            created: post.data.created_utc,
            score: post.data.score,
            is_self: post.data.is_self,
            selftext: post.data.selftext
          };
          subredditPosts.push(postObj);
        }
        resolve(subredditPosts);
      });
  });
}

function generateHTML(postObject, subreddit) {
    var container = new Tag("div").style({
        margin: "20px"
    });
        var subredditContainer = new Tag("div");
        var h2SubredditName = new Tag("h2", "Top posts from /r/" + subreddit).style({
            "font-size": "24px",
            "font-weight": "900"
        });
        subredditContainer.addChild(h2SubredditName);

        var postList = new Tag("ol").style({
            "list-style-type": "decimal",
            "font-size": "20px",
            "border-top": "2px solid black"
        });
        var postNumber = 0;
        for(var j in postObject) {
            var post = postObject[j];
            var liPost = new Tag("li");
            if(postNumber++ !== 0) {
                liPost.style({
                    "border-top": "1px solid darkgrey"
                });
            }
            var divPost = new Tag("div");
            liPost.addChild(divPost);

            var titleDomain = new Tag("div");
            var title = new Tag("a", post.title).attr({
                href: post.url
            });
            var domain = new Tag("span", "(" + post.domain + ")").style({
                "color": "grey",
                "font-size": "16px",
                "margin-left": "5px"
            });
            titleDomain.addChild(title).addChild(domain);
            divPost.addChild(titleDomain);

            var username = new Tag("span", post.author).style({
                color: "dodgerblue"
            });
            var postInfo = new Tag("div", "Posted by " + username.html()).style({
                "font-size": "16px"
            });
            divPost.addChild(postInfo);

            var score = new Tag("div", "Score: " + post.score).style({
                "font-size": "16px"
            });
            divPost.addChild(score);

            if(post.is_self) {
                var selfText = new Tag("div", post.selftext).style({
                    "font-size": "16px",
                    "border": "1px solid lightgrey",
                    "border-radius": "1px",
                    "background-color": "ghostwhite",
                    "margin-bottom": "5px"
                });
                divPost.addChild(selfText);
            }

            postList.addChild(liPost);
        }

        subredditContainer.addChild(postList);

        container.addChild(subredditContainer);

    return container.html();
}

function emailHTML(html, email, subreddit, resolve, reject) {
    var password = process.env.PASSWORD;

    var transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Top Posts from /r/' + subreddit,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            reject("Error sending email.");
        } else {
            console.log('Email sent: ' + info.response);
            console.log('-----------------------------');
            console.log('From: ' + mailOptions.from);
            console.log('To: ' + mailOptions.to);
            console.log('Subject: ' + mailOptions.subject);
            resolve("Email sent successfully.")
        }
    });
}

function apiUrl(subreddit, limit) {
    var url = "https://www.reddit.com/r/";
    url += subreddit;
    url += "/top/.json?limit=";
    url += limit;
    return url;
}

module.exports = {
  composeEmail
}
