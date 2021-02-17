const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();

// Tells express to use ejs as its templating language/ configurations
app.set("view engine", "ejs");

// "DATABASES"
const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

const users = {};


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
    user_id: req.cookies["user_id"],
    users,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// Create new TinyURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    users
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
    user_id: req.cookies["user_id"],
    users,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// Register get handler
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    users
  };
  res.render("register", templateVars);
});

// Redister Post handler
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = req.body.password
  
  // check new user details
  if (email === "") {
    res.status(400).send("Error 400: Email field was blank");
  } else if (password === "") {
    res.status(400).send("Error 400: Password field was blank");
  } else if (emailExists(email, users)) {
    res.status(400).send("Error 400: Email has already been registered.");
  } else {
    users[id] = {
      id,
      email,
      password
    };
  }
  

  console.log(users);

  res.cookie("user_id", users[id].id)

  res.redirect("/urls");
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
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

// LOGOUT POST handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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

// ERROR 404 Handler
app.use((req, res, next) => {
  templateVars = {
    user_id: req.cookies.user_id,
    users
  }
  res.status(404).render("error404", templateVars);
});

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

// Check email account if they already exist list
const emailExists = (value, usersDb) => {
  const emailList = [];
  let keys = Object.keys(usersDb);
  for (const key of keys) {
    if (usersDb[key].email === value) {
      return true;
    }
  }
  return false;
};

