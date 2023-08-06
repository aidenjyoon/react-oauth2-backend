import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import User from "./User";
import { IMongoDBUser, interfaceUser } from "./types";
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
app.use(
  cors({ origin: "https://reactoauth20.netlify.app", credentials: true })
);

app.set("trust proxy", 1);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: "none", // since we are using new page for signing in
      secure: true, // require httpes
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week in ms
    },
  })
);

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());

// taking entire user object we get from the authentication method
// and storing them into sessions
passport.serializeUser((user: IMongoDBUser, done: any) => {
  return done(null, user._id);
});

// taking entire user object from the session and attaching it to the req.user object
// (Bad. we should only store user ID in better apps)
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const doc: IMongoDBUser = await User.findById(id);
    return done(null, doc);
  } catch (err) {
    console.error(err, "Unable to find the user");
  }
});

// Work Flow w/serialize deserialize
// Login with Google
// Create a user in MongoDB
// Serialize & Deserialize -> grab that user from the database and return him

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        const doc: IMongoDBUser = await User.findOne({ googleId: profile.id });

        if (!doc) {
          const newUser = new User({
            googleId: profile.id,
            username: profile.name.givenName,
          });

          await newUser.save();
          cb(null, newUser);
        }
        // Continue with the callback function or return the user object
        // based on your implementation
        cb(null, doc);
      } catch (err) {
        console.error(
          "Error while trying to save google user to database: ",
          err
        );
        cb(err, null);
      }
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
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        // find user
        const doc: IMongoDBUser = await User.findOne({ twitterId: profile.id });

        // create new user if not found
        if (!doc) {
          const newUser = new User({
            twitterId: profile.id,
            username: profile.username,
          });

          await newUser.save();
          cb(null, newUser);
        }
        // Continue with the callback function or return the user object
        // based on your implementation
        cb(null, doc);
      } catch (err) {
        console.error(
          "Error while trying to save twitter user to database: ",
          err
        );
        cb(err, null);
      }
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
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        // find user
        const doc: IMongoDBUser = await User.findOne({ githubId: profile.id });

        // create new user if not found
        if (!doc) {
          const newUser = new User({
            githubId: profile.id,
            username: profile.username,
          });

          await newUser.save();
          cb(null, newUser);
        }
        // Continue with the callback function or return the user object
        // based on your implementation
        cb(null, doc);
      } catch (err) {
        console.error(
          "Error while trying to save twitter user to database: ",
          err
        );
        cb(err, null);
      }
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
    async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      try {
        // find user
        const doc: IMongoDBUser = await User.findOne({ twitchId: profile.id });

        // create new user if not found
        if (!doc) {
          const newUser = new User({
            twitchId: profile.id,
            username: profile.userName,
          });

          await newUser.save();
          cb(null, newUser);
        }
        // Continue with the callback function or return the user object
        // based on your implementation
        cb(null, doc);
      } catch (err) {
        console.error(
          "Error while trying to save twitch user to database: ",
          err
        );
        cb(err, null);
      }
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
    res.redirect("https://reactoauth20.netlify.app");
  }
);

// // TWITTER
app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("https://reactoauth20.netlify.app");
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
    res.redirect("https://reactoauth20.netlify.app");
  }
);

// // TWITCH
app.get("/auth/twitch", passport.authenticate("twitch"));

app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("https://reactoauth20.netlify.app");
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

app.get("/auth/logout", (req, res) => {
  if (req.user) {
    // logout using passport
    req.logout((err) => {
      if (err) {
        console.error(err, "logout failed");
      }
    });
    res.send("logout successful!");
  }
});

const host = "0.0.0.0";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(port, host, () => {
  console.log("server started");
});
