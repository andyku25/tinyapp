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

// POST handler for urls/
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

// View the selected short URL details
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// View the selected short URL details
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res, next) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.status(404);
    return res.render("error404");
  }
  res.redirect(longURL);
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


// HELPERS
// radix base 36
function generateRandomString() {
  let output = "";
  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random() * 1000) % 36;
    if (randomChar < 10 ) {
      output += randomChar.toString(36);
    } else {
      output += Math.round((Math.random() * 10)) % 2 === 0 ? randomChar.toString(36).toUpperCase() : randomChar.toString(36);
    }
  }
  return output;
};

