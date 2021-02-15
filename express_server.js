const express = require("express");
const app = express();
const PORT = 8080;

// Tells express to use ejs as its templating language
app.set("view engine", "ejs");

// infile "database" setup
const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});