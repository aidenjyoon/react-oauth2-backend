import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
var GoogleStrategy = require("passport-google-oauth20");
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
      clientID:
        "712861010049-flgco3acveii0e8adca2knlk8htf5qi4.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      // Called on Successful Authentication!
      // Insert into Database
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
    // Successful authentication, redirect to home
    res.redirect("/");
  }
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(4000, () => {
  console.log("server started");
});
