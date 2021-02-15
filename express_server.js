const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

// Tells express to use ejs as its templating language/ configurations
app.set("view engine", "ejs");

// infile "database" setup
const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

// Converts all buffer data into sting in human readable form
app.use(bodyParser.urlencoded({extended: true})); // before all routes

// root/home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Display the URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create new TinyURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// View the selected short URL details
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// View JSON details from the "url database"
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Hello view test code
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Activate server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});