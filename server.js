// server.js
// where your node app starts

// init project
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { nanoid } = require("nanoid");
var cors = require("cors");
var app = express();
var port = process.env.PORT || 3000;

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected");
});

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + "/views/timestamp.html");
});

app.get("/header-parser", function (req, res) {
  res.sendFile(__dirname + "/views/headerparser.html");
});

app.get("/url-shortener", function (req, res) {
  res.sendFile(__dirname + "/views/urlshortener.html");
});

app.get("/exercise-tracker", function (req, res) {
  res.sendFile(__dirname + "/views/exercise-tracker.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Timestamp Microservice Project
app.get("/api/timestamp", function (req, res) {
  let now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString(),
  });
});

app.get("/api/timestamp/:date", function (req, res) {
  let date = Date.parse(req.params.date);

  if (isNaN(date)) {
    date = new Date(Number(req.params.date));
  }

  passed_value = new Date(date);

  // console.log(passed_value)

  if (passed_value == "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({
      unix: passed_value.getTime(),
      utc: passed_value.toUTCString(),
    });
  }
});

// Request Header Parser Microservice Project
app.get("/api/whoami", function (req, res) {
  let now = new Date();

  res.json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

// URL Shirtener Microservice

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

const UrlModel = mongoose.model("UrlModel", urlSchema);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/shorturl/new", function (req, res) {
  var input_url = req.body.url;

  var regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  if (!regex.test(input_url)) {
    res.json({
      error: "invalid URL",
    });
  } else {
    var short_url = nanoid(5);

    let newURL = new UrlModel({
      original_url: input_url,
      short_url: short_url,
    });

    newURL.save(function (err, data) {
      if (err) return console.log(err);
      res.json({
        original_url: newURL.original_url,
        short_url: newURL.short_url,
      });
    });
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  UrlModel.findOne({ short_url: req.params.short_url }, (err, data) => {
    if (err) return console.log(err);
    res.redirect(data.original_url);
  });
});

// Exercise Tracker

let exerciseSessionSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseSessionSchema],
});

let Session = mongoose.model("Session", exerciseSessionSchema);
let User = mongoose.model("User", userSchema);

app.post(
  "/api/exercise/new-user",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    User.find({ username: req.body.username }).exec((err, users) => {
      if (!users.length) {
        let newUser = new User({
          username: req.body.username
        });
        newUser.save((err, savedUser) => {
          if (err) return console.log(err);
          res.json({
            _id: savedUser._id,
            username: savedUser.username
          });
        });
      } else {
        res.send("Username already taken");
      }
    });
  }
);

app.get("/api/exercise/users", (req, res) => {
  User.find({})
    .select({ log: 0 })
    .exec((err, data) => {
      if (!err) {
        res.json(data);
      }
    });
});

app.post(
  "/api/exercise/add",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let newSession = new Session({
      duration: req.body.duration,
      description: req.body.description,
      date: req.body.date,
    });

    if (newSession.date === "") {
      newSession.date = new Date().toISOString().substring(0, 10);
    }

    User.findByIdAndUpdate(
      req.body.userId,
      { $push: { log: newSession } },
      { new: true },
      (err, updatedUser) => {
        res.json({
          _id: updatedUser._id,
          username: updatedUser.username,
          date: new Date(newSession.date).toDateString(),
          duration: newSession.duration,
          description: newSession.description,
        });
      }
    );
  }
);

app.get("/api/exercise/log", (req, res) => {
  User.findById(req.query.userId, (err, result) => {
    if (!err) {
      // let resObj = result;
      // resObj['count'] = result.log.length;
      res.json({
        ...result._doc,
        count: result._doc.log.length
      });
    }
  });
});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
