const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();

// Tells express to use ejs as its templating language/ configurations
app.set("view engine", "ejs");

// infile "database" setup
const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

// Converts all buffer data into sting in human readable form
app.use(bodyParser.urlencoded({extended: true})); // before all routes
app.use(cookieParser());

// root/home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Display the URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Create new TinyURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
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
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// DELETE btn post method redirect to index page "/urls"
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// UPDATE the short URL details
app.post("/urls/:shortURL", (req, res) => {
  
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");
});

// View the selected short URL details
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.status(404);
    return res.render("error404");
  }
  res.redirect(longURL);
});

// LOGIN POST handler
app.post("/login", (req, res) => {

  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// LOGOUT POST handler
app.post("/logout", (req, res) => {
  console.log(req.cookies.username);
  res.clearCookie("username");
  res.redirect("/urls");
});

// TEST CODE?
// // View JSON details from the "url database"
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // Hello view test code
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// Activate server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});


// HELPERS
// radix base 36
const generateRandomString = () => {
  let output = "";
  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random() * 1000) % 36;
    if (randomChar < 10) {
      output += randomChar.toString(36);
    } else {
      output += Math.round((Math.random() * 10)) % 2 === 0 ? randomChar.toString(36).toUpperCase() : randomChar.toString(36);
    }
  }
  return output;
};
