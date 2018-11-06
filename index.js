const express = require("express");
const app = express(); // Initialiser un serveur

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // Import de body-parser

const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI,
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
app.get("/api/rassurer", function(req, res) {
  res.json({ test: "terrible !" });
});

app.post("/api/word-wrap", function(req, res) {
  const resultText = [];
  const textToWrap = req.body.text;
  for (i = 0; i < textToWrap.length; i = i + 80) {
    let enigma = textToWrap.slice(i, i + 80);
    console.log("------------------");
    console.log("valeur de i", i);
    console.log("textToWrap[i + 78] ", textToWrap[i + 78]);
    console.log('textToWrap[i + 78] === " "', textToWrap[i + 78] === " ");
    console.log("------------------");
    console.log(resultText);
    console.log("-------------------");
    if (textToWrap[i + 78] === " ") {
      resultText.push(enigma);
    } else {
      resultText.push(enigma + "-");
    }
  }
  let finalResult = resultText.join("\n");
  res.json({ wrapped: finalResult });
});

// Démarrer le serveur
const port = process.env.PORT;
app.listen(port, function() {
  console.log("Server started");
});
