const PORT = 8080;

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcrypt");
const { generateRandomString, validateNewUser, validateLogin, urlsForUser } = require("./helpers");


const testDbPw = "qwerty";
const testHashedPw = bcrypt.hashSync(testDbPw, 10);

const app = express();

// Tells express to use ejs as its templating language/ configurations
app.set("view engine", "ejs");

// "DATABASES"
const urlDatabase = {
  "b2xVn2": { longURL: "http://lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://google.com", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": { id: "aJ48lW", email:"test@test.com", password: testHashedPw } 
};

// Converts all buffer data into sting in human readable form
app.use(bodyParser.urlencoded({extended: true})); // before all routes(get/post)
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4xcc-acd7-eeb2ccb368d5', 's13b4b3m-41c8-47d3-93f6-8836do3cd8eb']
}))

// Register get handler
app.get("/register", (req, res) => {
  const templateVars = {
    userID: req.session["userID"],
    users
  };
  res.render("register", templateVars);
});

// Register Post handler
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const newUser = validateNewUser(email, password, users);
  
  if (!newUser.id) {
    return res.status(400).send(`Error 400: ${newUser.error}`);
  } else {
    users[newUser.id] = {
      id: newUser.id,
      email: newUser.email,
      password: newUser.password
    }
  }
  // console.log(users);
  req.session.userID = users[newUser.id].id;
  res.redirect("/urls");
});

// LOGIN GET handler
app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session["userID"],
    users
  };
  res.render("login", templateVars);
});

// LOGIN POST handler
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = validateLogin(email, password, users);

  if (!currentUser.id) {
    return res.status(403).send(`Error 403: ${currentUser.error}`);
  }
  req.session.userID = currentUser.id;
  res.redirect("/urls");
});

// LOGOUT POST handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Display the URLS
app.get("/urls", (req, res) => {
  const userID = req.session["userID"];
  const templateVars = {
    userID,
    users,
  };
  if (!userID) {
    templateVars.urls = {};
  } else {
    const usersUrls = urlsForUser(userID, urlDatabase);
    templateVars.urls = usersUrls;
  };
  res.render("urls_index", templateVars);
});

// Create new TinyURL
app.get("/urls/new", (req, res) => {
  const currentUser = req.session.userID;
  if (!currentUser) {
    return res.redirect("/login");
  }
  const templateVars = {
    userID: currentUser,
    users
  };
  res.render("urls_new", templateVars);
});

// POST handler for urls/
app.post("/urls", (req, res) => {
  const currentUser = req.session.userID;
  if (!currentUser) {
    return res.status(500).send("Error 500: Bad Request! Please login!");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: currentUser };
  res.redirect(`/urls`);
});

// View the selected short URL details
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session["userID"];
  if (!currentUser) {
    return res.status(404).send("Error 404: Page not found! Please try logging in.")
  }
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === currentUser) {
    const templateVars = {
      userID: currentUser,
      users,
      urls: urlDatabase,
      shortURL,
      longURL: urlDatabase[shortURL],
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("Error 403: Forbidden Request!");
  }
});

// UPDATE the short URL details
app.post("/urls/:shortURL", (req, res) => {
  const currentUser = req.session["userID"];
  if (!currentUser) {
    return res.status(403).send("Error 403: Forbidden");
  }
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL].userID === currentUser) {
    urlDatabase[shortURL] =  { longURL: req.body.longURL, userID: currentUser };
  } else {
    return res.status(404).send("Error 404: Page not found")
  }
  res.redirect("/urls");
});


// DELETE btn post method redirect to index page "/urls"
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = req.session["userID"];
  if (!currentUser) {
    return res.status(403).send("Error 403: Forbidden")
  }
  if (urlDatabase[req.params.shortURL].userID === currentUser) {
    delete urlDatabase[req.params.shortURL];
  } else {
    return res.status(403).send("Error 403: Forbidden")
  }
  res.redirect("/urls");
});


// View the selected short URL details
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(404);
    return res.render("error404");
  } else {
    res.redirect(longURL);
  }
});

// TEST CODE?
// root/home page
app.get("/", (req, res) => {
  currentUser = req.session.userID;
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// ERROR 404 Handler
app.use((req, res, next) => {
  templateVars = {
    userID: req.session.userID,
    users
  }
  res.status(404).render("error404", templateVars);
});

// Activate server to listen for requests
app.listen(PORT, () => {
  console.log(`TinyApp server is listening on port ${PORT}`);
});
