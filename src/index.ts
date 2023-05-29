import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const TwitchStrategy = require("passport-twitch-new").Strategy;

// const GitHubStrategy = require("passport-github").Strategy;
// import GoogleStrategy from "passport-google-oauth20"

// load variables
dotenv.config();

const app = express();

// mongoose.connect(
//   `${process.env.START_MONGODB}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.END_MONGODB}}`
// );

// when i got Error: querySrv ENODATA _mongodb._tcp....
mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@ac-yxyyahc-shard-00-00.mvliffh.mongodb.net:27017,ac-yxyyahc-shard-00-01.mvliffh.mongodb.net:27017,ac-yxyyahc-shard-00-02.mvliffh.mongodb.net:27017/?ssl=true&replicaSet=atlas-10oxf3-shard-0&authSource=admin&retryWrites=true&w=majority
`);

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

// taking entire user object we get from the authentication method
// and storing them into sessions
passport.serializeUser((user: any, done: any) => {
  return done(null, user);
});

// taking entire user object from the session and attaching it to the req.user object
// (Bad. we should only store user ID in better apps)
passport.deserializeUser((user: any, done: any) => {
  return done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      // Called on Successful Authentication!
      // Insert into Database
      console.log("successfully logged in");
      console.log(profile);
      cb(null, profile);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/auth/twitter/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      // Called on Successful Authentication!
      // Insert into Database
      console.log("successfully logged in");
      console.log(profile);
      cb(null, profile);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      // Called on Successful Authentication!
      // Insert into Database
      console.log("successfully logged in");
      console.log(profile);
      cb(null, profile);
    }
  )
);

passport.use(
  new TwitchStrategy(
    {
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: "/auth/twitch/callback",
      scope: "user_read",
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      // Called on Successful Authentication!
      // Insert into Database
      console.log("successfully logged in");
      console.log(profile);
      cb(null, profile);
    }
  )
);

///// GOOGLE
// 1.
// get request that will authenticate user based on the configuations above (GoogleStrategy we've implemented)
// then calls the function on a successful authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// 2.
// runs callback after to redirect to home
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to frontend homepage
    res.redirect("http://localhost:3000");
  }
);

// // TWITTER
app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

// // GITHUB
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

// // TWITCH
app.get("/auth/twitch", passport.authenticate("twitch"));

app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// receives all the data of user because it gets attached to the deserialized function
// gets called by context
app.get("/getuser", (req, res) => {
  res.send(req.user);
});

app.listen(4000, () => {
  console.log("server started");
});
