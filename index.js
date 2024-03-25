// const express = require("express");
import express from "express"
const app = express();
import jwt from "jsonwebtoken"
// const jwt = require("jsonwebtoken");

import cors from "cors"
// const cors = require('cors')
import fmDB  from "./db.js"


const FMKEY="dsafadf232"
const whitelist = ["http://localhost:3000","https://fmc4.onrender.com/"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(express.json());
app.use(cors(corsOptions))
app.use(express.static("public"))

const users = [
  {
    id: "1",
    username: "111",
    password: "111",
    isAdmin: true,
  },
  {
    id: "2",
    username: "222",
    password: "222",
    isAdmin: false,
  },
];

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, FMKEY, {
    expiresIn: "5000s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  console.log("api/login is called")
  const { username, password } = req.body;
  console.log(username, password)
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //Generate an access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("用戶名或");
  }
});

const verify = (req, res, next) => {
  console.log('verify is called')
  // console.log(req.headers)
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log('token',token)

    jwt.verify(token, FMKEY, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
});

fmDB.initDB()
fmDB.test()
app.listen(5000, () => console.log("Backend server is running!"));