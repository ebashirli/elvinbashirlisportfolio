// server.js
// where your node app starts

// init project
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var multer = require("multer");
const { nanoid } = require("nanoid");
var cors = require("cors");
var app = express();
var port = process.env.PORT || 3001;

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
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Responsive Web Design Projects
app.get("/tribute-page", (req, res) => {
  res.sendFile(__dirname + "/views/responsive-web-design/tribute-page.html");
});

app.get("/survey-form", (req, res) => {
  res.sendFile(__dirname + "/views/responsive-web-design/survey-form.html");
});

app.get("/product-landing-page", (req, res) => {
  res.sendFile(__dirname + "/views/responsive-web-design/product-landing-page.html");
});

app.get("/technical-documentation-page", (req, res) => {
  res.sendFile(__dirname + "/views/responsive-web-design/technical-documentation-page.html");
});

app.get("/personal-portfolio-webpage", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Front End Development Libraries Projects
app.get("/random-quote-machine", (req, res) => {
  res.sendFile(__dirname + "/views/front-end-development-libraries/random-quote-machine.html");
});

app.get("/markdown-previewer", (req, res) => {
  res.sendFile(__dirname + "/views/front-end-development-libraries/markdown-previewer.html");
});

app.get("/drum-machine", (req, res) => {
  res.sendFile(__dirname + "/views/front-end-development-libraries/drum-machine.html");
});

app.get("/javascript-calculator", (req, res) => {
  res.sendFile(__dirname + "/views/front-end-development-libraries/javascript-calculator.html");
});

app.get("/25-5-clock", (req, res) => {
  res.sendFile(__dirname + "/views/front-end-development-libraries/25-5-clock.html");
});

// APIs and Microservices Projects
// 1.
app.get("/timestamp", (req, res) => {
  res.sendFile(__dirname + "/views/apis-and-microservices/timestamp.html");
});
// 2
app.get("/request-header-parser", (req, res) => {
  res.sendFile(__dirname + "/views/apis-and-microservices/requestheaderparser.html");
});
// 3.
app.get("/url-shortener", (req, res) => {
  res.sendFile(__dirname + "/views/apis-and-microservices/urlshortener.html");
});
// 4.
app.get("/exercise-tracker", (req, res) => {
  res.sendFile(__dirname + "/views/apis-and-microservices/exercise-tracker.html");
});
// 5.
app.get("/file-metadata", (req, res) => {
  res.sendFile(__dirname + "/views/apis-and-microservices/file-metadata.html");
});

// Quality Assurance Projects
// 1.
app.get("/metric-imperial-converter", (req, res) => {
  res.sendFile(__dirname + "/views/quality-assurance/metric-imperial-converter.html");
});

// Timestamp Microservice Project
app.get("/api/timestamp", (req, res) => {
  let now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString(),
  });
});

app.get("/api/timestamp/:date", (req, res) => {
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
app.get("/api/whoami", (req, res) => {
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

app.post("/api/shorturl/new", (req, res) => {
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

    newURL.save((req, res) => {
      if (err) return console.log(err);
      res.json({
        original_url: newURL.original_url,
        short_url: newURL.short_url,
      });
    });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
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
          username: req.body.username,
        });
        newUser.save((err, savedUser) => {
          if (err) return console.log(err);
          res.json({
            _id: savedUser._id,
            username: savedUser.username,
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
      let resObj = result._doc;

      if (req.query.from || req.query.to) {
        let fromDate = new Date(0);
        let toDate = new Date();

        if (req.query.from) {
          fromDate = new Date(req.query.from);
        }

        if (req.query.to) {
          toDate = new Date(req.query.to);
        }

        fromDate = fromDate.getTime();
        toDate = toDate.getTime();

        resObj.log = resObj.log.filter((sess) => {
          let sessDate = new Date(sess.date).getTime();

          return sessDate >= fromDate && sessDate <= toDate;
        });
      }

      if (req.query.limit) {
        resObj.log = resObj.log.slice(0, req.query.limit);
      }

      resObj["count"] = result._doc.log.length;
      res.json(resObj);
    }
  });
});

// File Metadata
app.post("/api/fileanalyse", multer().single("upfile"), (req, res) => {
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

// listen for requests :)
var listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
