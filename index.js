const express = require("express");
const app = express(); // Initialiser un serveur

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // Import de body-parser

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost:27017/wordWrap-API" || process.env.MONGODB_URI, // process.env.MONGODB_URI ||
  { useNewUrlParser: true }
); // Import de mongoose et connection à une database

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const UserModel = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    unique: true
  },
  token: String,
  hash: String,
  salt: String
});

app.post("/api/sign_up", function(req, res) {
  const newUser = new UserModel(req.body);
  const password = req.body.password;
  const token = uid2(16);
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);

  newUser.token = token;
  newUser.hash = hash;
  newUser.salt = salt;

  newUser.save(function(err, createdUser) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(200).json({
        token: createdUser.token
      });
    }
  });
});

app.post("/api/word-wrap", function(req, res) {
  realToken = req.headers.authorization.substring(7);
  // console.log(realToken);
  UserModel.findOne({ token: realToken }).exec(function(err, tokenReq) {
    // console.log(tokenReq);
    if (tokenReq === null) {
      return res.status(401).json({
        error: {
          message: "Invalid token"
        }
      });
    } else {
      const resultText = [];
      const textToWrap = req.body.text.split("");
      for (i = 0; i < textToWrap.length; i = i + 80) {
        let enigma = textToWrap.slice(i, i + 80).join("");
        // console.log("-----------------------------");
        // console.log("i + 80 c'est celui-là : " + textToWrap[i + 80]);
        // console.log("enigma : " + enigma);
        // console.log("-----------------------------");
        if (textToWrap[i + 80] === " ") {
          resultText.push(enigma);
        } else if (textToWrap[i + 79] === " ") {
          resultText.push(enigma);
        } else if (
          textToWrap[i + 80] === undefined ||
          textToWrap[i + 79] === undefined
        ) {
          resultText.push(enigma);
        } else {
          resultText.push(enigma + "-");
        }
      }
      let finalResult = resultText.join("\n");
      res.status(200).json({ wrapped: finalResult });
    }
  });
});

// app.get("/", function(req, res) {
//   res.send("franchement, sofiane c un bg");
// });
// Démarrer le serveur`
const port = 3000; //process.env.PORT ||
app.listen(port || process.env.PORT, function() {
  console.log("Server started");
});
