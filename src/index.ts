import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
// import GoogleStrategy from "passport-google-oauth20"

// load variables
dotenv.config();

const app = express();

mongoose.connect(
  `${process.env.START_MONGODB}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.END_MONGODB}}`
);

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

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
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
